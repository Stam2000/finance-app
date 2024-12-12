import { handleRunStatus } from "@/lib/AI/functions-ai-chat";
import { Hono } from "hono";
import { z } from "zod";
import { openai } from "@/lib/AI/create-ai-functions";
import { GenTemplate } from "@/lib/AI/generate-data";
import { DataGenerator } from "@/lib/AI/generate-data";
import { zValidator } from "@hono/zod-validator";
import { uploadEntitiesAndReplaceReferences } from "@/lib/utils";
import { client } from "@/lib/hono";
import { PersonaExtender } from "@/lib/AI/generate-data";
import { createId } from "@paralleldrive/cuid2";
import pLimit from "p-limit";
import { subMonths, format, subDays, addDays } from "date-fns";
import { FollowUpQuestion } from "@/lib/AI/generate-data";
import { langChain } from "@/lib/AI/functions-langchain";
import { convertAmountToMiliunits } from "@/lib/utils";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
  formatInstExtenderGen,
  promptDetails,
  promptFundamentalWeek,
  promptRefine,
} from "@/lib/AI/prompts";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

const model: any = new ChatOpenAI({
  model: "gpt-4o",
});

const TransactionInterfaceSchema = z.object({
  categories: z.array(
    z.object({
      name: z.string(),
      goal: z.number().nullable(),
    }),
  ),
  accounts: z.array(
    z.object({
      name: z.string(),
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      budget: z.number(),
      startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format",
      }),
      endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format",
      }),
      description: z.string().optional(),
    }),
  ),
  transactions: z.array(
    z.object({
      amount: z.number(),
      detailsTransactions: z.array(
        z.object({
          name: z.string().nullable(),
          quantity: z.number().nullable(),
          unitPrice: z.number().nullable(),
          amount: z.number(),
          categoryId: z.string().nullable(),
          projectId: z.string().nullable(),
        }),
      ),
      payee: z.string(),
      notes: z.string().nullable(),
      date: z.string(),
      projectId: z.string().nullable(),
      accountId: z.string(),
      categoryId: z.string().nullable(),
    }),
  ),
});

const parserDataschema = StructuredOutputParser.fromZodSchema(
  TransactionInterfaceSchema,
);

// Helper function to create SSE messages
const createSSEMessage = (event: string, data: any) => {
  const encoder = new TextEncoder();
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
};

const conversation = new Hono()
  .post("/", async (c) => {
    let message: any = { role: "user" };
    const personaId = c.req.header("X-Persona-ID") || "testData";
    const f = await c.req.formData();
    const personaInfo = f.get("personaInfo");
    const threadIdEntry = f.get("threadId");
    let threadId: string = "";

    if (typeof threadIdEntry === "string") {
      threadId = threadIdEntry;
    } else {
      // Handle the case where threadId is not provided or is a File
      threadId = "";
    }

    if (threadId === "") {
      const emptyThread = await openai.beta.threads.create();
      threadId = emptyThread.id;
    }
    message["content"] = [
      { type: "text", text: f.get("question")?.toString()! },
    ];

    for (let entry of f.entries()) {
      const [key, value] = entry;

      if (key === "file" && value instanceof File) {
        const [type, extention] = value.type.split("/");
        if (type === "image") {
          // upload it and add it to the message array

          const image = await openai.files.create({
            file: value,
            purpose: "assistants",
          });

          message["content"].push({
            type: "image_file",
            image_file: { file_id: image.id },
          });
        } else {
          // upload it and add it to the attachements
          const file = await openai.files.create({
            file: value,
            purpose: "assistants",
          });

          if (message.attachements) {
            message["attachments"] = [
              ...message.attachments,
              {
                file_id: file.id,
                tools: [{ type: "code_interpreter" }],
              },
            ];
          } else {
            message["attachments"] = [
              {
                file_id: file.id,
                tools: [{ type: "code_interpreter" }],
              },
            ];
          }
        }
      }
    }

    try {
      const threadMessages = await openai.beta.threads.messages.create(
        threadId!,
        message,
      );
    } catch (err) {
      console.error(err);
    }

    try {
      let run = await openai.beta.threads.runs.createAndPoll(threadId!, {
        assistant_id: "asst_x1O38JZm8yr6KApu0IkdMzQ4",
        instructions: `remember : very important - don't use the date of your last update:2023. only consider,refer the actual date of the user :${JSON.stringify(new Date())} for your raisonning. Address the user with his name user Info:${personaInfo}. all retrieved informations are in Dollar$ no need to convert them into local currency. use the US DOLLAR as currency `,
      });
      const output = await handleRunStatus(run, openai, threadId, personaId);
      return c.json({ response: { output, threadId } }, 200);
    } catch (err) {
      return c.json(
        {
          response: {
            output:
              "There was a problem completing your request. Please try again or report the error",
            threadId,
          },
        },
        500,
      );
    }
  })
  .post("/followUpGestions", async (c) => {
    const { personaDes, followHistory } = await c.req.json();
    const personaId = c.req.header("X-Persona-ID") || "testData";

    const currentDate = new Date();
    const fourMonthsBefore = subMonths(currentDate, 2);

    const from = format(fourMonthsBefore, "yyyy-MM-dd");
    const to = format(currentDate, "yyyy-MM-dd");

    try {
      const res = await client.api.transactions.$get(
        {
          query: {
            from,
            to,
          },
        },
        {
          headers: {
            // Add persona ID to request headers
            "X-Persona-ID": personaId,
            // You can add other persona-related headers if needed
          },
        },
      );

      const { data } = await res.json();
      const transactionsString = JSON.stringify(data);
      const response = await FollowUpQuestion(
        transactionsString,
        personaDes,
        followHistory,
      );
      return c.json({ data: response });
    } catch (err) {
      return c.json({ data: ["something went wrong"] });
    }
  })
  .post("/weeklyResume", async (c) => {
    const personaDes = await c.req.json();
    const personaId = c.req.header("X-Persona-ID") || "testData";

    try {
      const { resume, reducedText } = await langChain(personaId, personaDes);

      return c.json({
        res: resume,
        reducedText: reducedText,
      });
    } catch (err) {
      console.error(err);
      return c.json(
        {
          error: "Failed to generate weekly resume",
        },
        500,
      );
    }
  })
  .get("/sampleDataChat", async (c) => {
    // Call your utility function
    const response = await GenTemplate();

    // Log the response from GenNewLg
    return c.json({ data: response });
  })
  .post(
    "/createProfil",
    zValidator(
      "json",
      z.object({
        name: z
          .string()
          .min(2, { message: "Name must be at least 2 characters" })
          .max(50),
        age: z
          .number({
            required_error: "Age is required",
          })
          .min(18, { message: "Age must be at least 18" })
          .max(100, { message: "Age must be at most 100" }),
        occupation: z
          .string()
          .min(2, { message: "Occupation must be at least 2 characters" })
          .max(50),
        familyStatus: z.enum(["single", "married", "married_with_children"], {
          required_error: "Family Status is required",
        }),
        incomeLevel: z.number().min(0).optional(),
        locationType: z.enum(["urban", "suburban", "rural"]).optional(),
        spendingBehavior: z
          .enum(["frugal", "balanced", "spendthrift"])
          .optional(),
        additionalInfo: z.string().optional(), // Added field to schema
        monthlyRent: z.number().min(0).optional(),
        monthlySavings: z.number().min(0).optional(),
        riskTolerance: z
          .enum(["conservative", "moderate", "aggressive"])
          .optional(),
        creditCards: z.enum(["rarely", "moderate", "frequent"]).optional(),
        workSchedule: z.enum(["regular", "shift", "flexible"]).optional(),
        transportation: z.enum(["car", "public", "mixed"]).optional(),
        diningPreference: z.enum(["homeCook", "mixed", "eatOut"]).optional(),
        shoppingHabits: z.enum(["planner", "mixed", "impulsive"]).optional(),
      }),
    ),
    async (c) => {
      c.header("Content-Type", "text/event-stream");
      c.header("Cache-Control", "no-cache");
      c.header("Connection", "keep-alive");

      const limit = pLimit(5);
      const data = c.req.valid("json");

      let cleanup: (() => Promise<void>) | null = null;

      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Send initial status
            controller.enqueue(
              createSSEMessage("extendPersona", {
                step: "extendPersona",
                status: "running",
                message: "Extending persona...",
              }),
            );

            // Store active connections for cleanup
            const activeConnections: Set<any> = new Set();
            cleanup = async () => {
              for (const conn of activeConnections) {
                await conn.destroy();
              }
              activeConnections.clear();
            };

            const guideLine = await PersonaExtender(data);

            controller.enqueue(
              createSSEMessage("extendedPersona", {
                step: "extendPersona",
                status: "completed",
                message: "full description completed",
                data: guideLine,
              }),
            );

            // Data generation phase
            /*           controller.enqueue(createSSEMessage('fiDataGenerationStart', {
            step: 'fiDataGeneration',
            status: "running",
            message: 'generating data...'
          })) */

            /* const response  = await DataGenerator(guideLine); */

            //Data gen

            const MEMORY_KEY = "chat_history";
            let History: BaseMessage[] = [];
            let refinedHistory: BaseMessage[] = [];

            const formatInstExtender = formatInstExtenderGen;
            const genPrompt = promptFundamentalWeek;

            const currentDate = new Date();
            const oneMonthsBefore = subDays(currentDate, 30);

            const dataGenPrompt = await ChatPromptTemplate.fromMessages([
              ["system", genPrompt],
              new MessagesPlaceholder(MEMORY_KEY),
              ["human", "{input}"],
            ]).partial({
              format_instructions: formatInstExtender,
            });

            const formatDetails = promptDetails;

            const refinePrompt = promptRefine;

            const refineChainPrompt = await ChatPromptTemplate.fromMessages([
              ["system", refinePrompt],
              new MessagesPlaceholder("refined_history"),
              ["human", "{input}"],
            ]).partial({
              format_instructions: formatDetails,
            });

            const refineChain = RunnableSequence.from([
              refineChainPrompt,
              model,
              parserDataschema,
            ]);

            const dataGenChain = RunnableSequence.from([
              dataGenPrompt,
              model,
              parserDataschema,
            ]);

            let transactions = [];

              console.log(
                `

    ############
    current week 
    ############

    `,
                week,
              );
              let succes: boolean = false;

              const weekStartDate = addDays(oneMonthsBefore, week * 7);
              const weekEndDate = addDays(weekStartDate, 6);

              // Format the dates as strings
              const weekStartDateStr = format(weekStartDate, "yyyy-MM-dd");
              const weekEndDateStr = format(weekEndDate, "yyyy-MM-dd");

              console.log(`
    
    ############
    weekStartDate:
    -${weekStartDateStr}
    ############

    ############
    weekEndDate:
    -${weekEndDateStr}
    ############

    `);

              let attempts = 0;

              const maxAttempts = 5;
              while (!succes && attempts < maxAttempts) {
                console.log(`

      ############
        attempt:
        -${attempts + 1}
        week:
        -${week + 1}
      ############
  
      `);
                setTimeout(() => {
                  attempts++;
                }, 3000);
                try {
                  let weekPrompt;

                  if (week === 0) {
                    // Initial prompt for the first week
                    weekPrompt = `Start generating the Transaction data. no need of Sample Data.
      Generate transactions for the next week (from ${weekStartDateStr} to ${weekEndDateStr}). directly response with the JSON object without any surrounding text or comment.
  Persona: ${guideLine}`;
                  } else if ((week + 1) % 4 === 0) {
                    // Specific prompt at the end of every 4 weeks
                    weekPrompt = `
      IMPORTANT: We have completed one month of data generation.
      Begin generating data for the next month.

      Generate transactions for the week from ${weekStartDateStr} to ${weekEndDateStr}.
      Ensure that recurring transactions continue appropriately and adjust any monthly patterns as needed.
      directly response with the JSON object without any surrounding text.
    `;

                    console.log(`

      ############
      Month termited 
      ############
  
      `);
                  } else {
                    // Regular weekly prompt
                    weekPrompt = `
      Generate transactions of the next, starting from ${weekStartDateStr} to ${weekEndDateStr} using the same persona.
      Ensure that all categories and projects used within all transactions are listed; if not, add them.
    `;
                  }

                  controller.enqueue(
                    createSSEMessage("weekGen", {
                      step: `weekGen-${week + 1}`,
                      status: "running",
                      message: `processing week ${week + 1}/4...`,
                    }),
                  );

                  const weekData = await dataGenChain.invoke({
                    input:
                      attempts > 1
                        ? `your failed generating the last  set of financial data(probalby due to a not respecting the JSON format or some internal error). this is your ${attempts + 1}.retry again. 
      .carefully respect the JSON format . directly response with the JSON object without any surrounding text. `
                        : weekPrompt,
                    chat_history: History,
                  });

                  const detailedWeekData = await refineChain.invoke({
                    input:
                      week === 0
                        ? attempts > 1
                          ? `your failed generating the last set of financial data. 
      this is your ${attempts + 1}.
       .Keep consistency accross all name you provide (Banks account names,...) some time you can change the name of products to break the monotony but only products not bank accounts,categories and projects names you generate .retry again. carefully respect  JSON format 
       .Directly response with the JSON object without any surrounding text. `
                          : `first week:${JSON.stringify(weekData)} persona:${guideLine}`
                        : `here is the next week :${JSON.stringify(weekData)} for the same persona same persona .now modify this week.
      . some time you can change the name of products to break the monotony but only products not bank accounts,categories and projects names you allready generated .ensure that all categories,projects used within all transactions are beeing listed if not add them. now modify this week. surprise me :)`,
                    refined_history: refinedHistory,
                  });

                  if ((week + 1) % 4 === 0) {
                    // After processing, update the history with the specific prompt
                    History.push(
                      new HumanMessage(`
      IMPORTANT: We have completed one month of data generation.
      Begin generating data for the next month.

      Generate transactions for the week from ${weekStartDateStr} to ${weekEndDateStr}.
      Ensure that recurring transactions continue appropriately and adjust any monthly patterns as needed.
      directly response with the JSON object without any surrounding text.
    `),
                    );
                    History.push(new AIMessage(JSON.stringify(weekData)));

                    refinedHistory.push(
                      new HumanMessage(
                        `We have completed one month of data generation. Begin generating data for the next month.generate next week input:${weekData}`,
                      ),
                    );
                    refinedHistory.push(
                      new AIMessage(JSON.stringify(detailedWeekData)),
                    );
                  } else {
                    // Regular update to the history
                    History.push(
                      new HumanMessage(`Generate transactions of the next, starting from ${weekStartDateStr} to ${weekEndDateStr} using the same persona.
      Ensure that all categories and projects used within all transactions are listed; if not, add them.`),
                    );
                    History.push(new AIMessage(JSON.stringify(weekData)));

                    refinedHistory.push(
                      new HumanMessage(`here is the next week :${JSON.stringify(weekData)} for the same persona same persona .now modify this week.
      .some time you can change the name of products to break the monotony but only products not bank accounts,categories and projects names you allready generated .ensure that all categories,projects used within all transactions are beeing listed if not add them. now modify this week. surprise me :)`),
                    );
                    refinedHistory.push(
                      new AIMessage(JSON.stringify(detailedWeekData)),
                    );
                  }

                  console.log(
                    `

  ######### Basic WEEK #########
  ############
  weekStartDate:
  -${weekStartDateStr}
  ############

  ############
  weekEndDate:
  -${weekEndDateStr}
  ############

  `,
                    weekData,
                  );

                  console.log(
                    `

  ######### Detailled WEEK #########
  ############
  weekStartDate:
  -${weekStartDateStr}
  ############

  ############
  weekEndDate:
  -${weekEndDateStr}
  ############

  `,
                    detailedWeekData,
                  );

                  transactions.push(detailedWeekData);

                  succes = true;

                  controller.enqueue(
                    createSSEMessage("weekGen", {
                      step: `weekGen-${week + 1}`,
                      status: "completed",
                      message: `week ${week + 1} generated 🌟`,
                    }),
                  );
                } catch (err) {
                  console.log(err);
                  if (attempts === maxAttempts) {
                    return "Something went wrong. Please try again.";
                  }

                  attempts++;
                }
              }
            }

            //fin data gen

            controller.enqueue(
              createSSEMessage("fiDataGenerationEnd", {
                step: "fiDataGeneration",
                status: "completed",
                message: "generation completed",
              }),
            );

            // Transaction processing
            const personaId = createId();
            controller.enqueue(
              createSSEMessage("updatingFiDataStart", {
                step: "updatingFiData",
                status: "running",
                message: "uploading data (database)",
              }),
            );

            const d = await uploadEntitiesAndReplaceReferences(
              transactions,
              personaId,
            );

            if (typeof d === "string") {
              throw new Error(d);
            }

            for (const week of d) {
              for (const transaction of week.transactions) {
                const detailsTransaction = transaction["detailsTransactions"];
                const { detailsTransactions, ...transacToUp } = transaction;
                const timestamp = Date.parse(transacToUp.date);

                try {
                  const responseTransaction =
                    await client.api.transactions.$post(
                      {
                        json: {
                          ...transacToUp,
                          amount: convertAmountToMiliunits(transacToUp.amount),
                          date: new Date(timestamp),
                        },
                      },
                      {
                        headers: {
                          "X-Persona-ID": personaId,
                        },
                      },
                    );

                  const { data } = await responseTransaction.json();

                  if (detailsTransaction) {
                    let completeDetailsTransaction = await Promise.all(
                      detailsTransaction.map((d) =>
                        limit(async () => {
                          try {
                            const responseDetail =
                              await client.api.detailsTransactions.$post(
                                {
                                  json: {
                                    ...d,
                                    amount: convertAmountToMiliunits(d.amount),
                                    unitPrice: d.unitPrice
                                      ? convertAmountToMiliunits(d.unitPrice)
                                      : d.unitPrice,
                                    transactionId: data.id,
                                  },
                                },
                                {
                                  headers: {
                                    "X-Persona-ID": personaId,
                                  },
                                },
                              );

                            const ress = await responseDetail.json();
                            return ress;
                          } catch (err) {
                            console.error(err);
                          }
                        }),
                      ),
                    );
                  }
                } catch (err) {
                  console.error(err);
                }
              }
            }

            controller.enqueue(
              createSSEMessage("updatingFiDataEnd", {
                step: "updatingFiData",
                status: "completed",
                message: "updating completed",
              }),
            );

            controller.enqueue(
              createSSEMessage("complete", {
                step: "complete",
                status: "completed",
                message: "Processing completed",
                data: personaId,
              }),
            );
          } catch (err: any) {
            controller.enqueue(
              createSSEMessage("error", {
                message: err.message,
                stack:
                  process.env.NODE_ENV === "development"
                    ? err.stack
                    : undefined,
              }),
            );

            throw err;
          } finally {
            if (cleanup) {
              await cleanup();
            }
            controller.close();
          }
        },

        cancel() {
          // Handle stream cancellation
          if (cleanup) {
            cleanup().catch(console.error);
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    },
  );

export default conversation;
