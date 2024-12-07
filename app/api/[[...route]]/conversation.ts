
import { handleRunStatus } from "@/lib/AI/functions-ai-chat"
import {Hono} from "hono"
import {z} from "zod"
import { openai } from "@/lib/AI/create-ai-functions"
import { GenTemplate } from "@/lib/AI/generate-data"
import { DataGenerator } from "@/lib/AI/generate-data"
import { zValidator } from "@hono/zod-validator"
import {uploadEntitiesAndReplaceReferences} from "@/lib/utils"
import { client } from "@/lib/hono"
import { PersonaExtender } from "@/lib/AI/generate-data"
import { createId } from "@paralleldrive/cuid2"
import pLimit from "p-limit"
import { subMonths, format } from "date-fns"
import { FollowUpQuestion } from "@/lib/AI/generate-data"
import { langChain } from "@/lib/AI/functions-langchain"
import { convertAmountToMiliunits } from "@/lib/utils"




// Helper function to create SSE messages
const createSSEMessage = (event: string, data: any) => {
  const encoder = new TextEncoder()
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}


const conversation = new Hono()
    .post(
    "/",
    async (c)=>{
    let message:any = {role:"user"}
     const personaId = c.req.header('X-Persona-ID') || "testData"
     const f = await c.req.formData()
     const personaInfo = f.get("personaInfo") 
     const threadIdEntry = f.get("threadId")
      let threadId: string = ''

      if (typeof threadIdEntry === 'string') {
          threadId = threadIdEntry
      } else {
          // Handle the case where threadId is not provided or is a File
          threadId = ''
      }
 
     if (threadId===''){
        const emptyThread = await openai.beta.threads.create()
        threadId = emptyThread.id
     }
     message["content"]=[{"type":"text","text":f.get("question")?.toString()!}]
    
     for (let entry of f.entries()) {

        const [key,value] = entry

        if(key==="file" && value instanceof File){
            const [type,extention] = value.type.split("/")
            if (type === "image"){
                // upload it and add it to the message array
               
                    const image = await openai.files.create(
                        {
                            file:value,
                            purpose:"assistants"
                        }
                    )
 
                message["content"].push({
                    "type":"image_file",
                    "image_file":{"file_id":image.id}
                })
            }else{
                // upload it and add it to the attachements
                const file = await openai.files.create(
                    {
                        file:value,
                        purpose:"assistants"
                    }
                )

            
            if(message.attachements){
                message["attachments"] = [...message.attachments,{
                    file_id:file.id,
                    tools:[{type:"code_interpreter"}]
                    }]
            }else{
                 message["attachments"] = [{
                file_id:file.id,
                tools:[{type:"code_interpreter"}]
                }]
            }
           
            
            }
        }
    }

    try{
        const threadMessages = await openai.beta.threads.messages.create(
            threadId!,
        message
    )
    }catch(err){
        console.error(err)
    }
    
    

    try{let run = await openai.beta.threads.runs.createAndPoll(
        threadId!,
        {assistant_id:"asst_x1O38JZm8yr6KApu0IkdMzQ4",
            instructions:`remember : very important - don't use the date of your last update:2023. only consider,refer the actual date of the user :${JSON.stringify(new Date())} for your raisonning. Address the user with his name user Info:${personaInfo}. all retrieved informations are in Dollar$ no need to convert them into local currency. use the US DOLLAR as currency `
          }
      )
     const output = await handleRunStatus(run,openai,threadId,personaId)
     return c.json({response:{output,threadId}},200)
    }catch(err){
        return c.json({response:{output:"There was a problem completing your request. Please try again or report the error",threadId}},500)
    }

})
.post("/followUpGestions",async(c)=>{

        const {personaDes,followHistory} =await c.req.json()
        const personaId = c.req.header('X-Persona-ID') || "testData"

        
        const currentDate = new Date();
        const fourMonthsBefore = subMonths(currentDate, 2);

        const from =format(fourMonthsBefore,"yyyy-MM-dd")
        const to =format(currentDate,"yyyy-MM-dd");

   
        try{
          const res = await client.api.transactions.$get({
                query:{
                    from,
                    to
                }, 
            },{
                headers: {
                    // Add persona ID to request headers
                    'X-Persona-ID': personaId,
                    // You can add other persona-related headers if needed
                    
                }
            })

          const {data} =await res.json()
          const transactionsString = JSON.stringify(data)
          const response =await FollowUpQuestion(transactionsString,personaDes,followHistory)
              return c.json({data:response})
        }catch(err){
          return c.json({data:["something went wrong"]})
        }


    

})
.post("/weeklyResume",async(c)=>{
  const personaDes = await c.req.json()
  const personaId = c.req.header('X-Persona-ID') ||"testData"
  
  try {
     const {resume, reducedText} = await langChain(personaId, personaDes)
     
    return c.json({
      res: resume,
      reducedText: reducedText
    });
  } catch (err) {
    console.error(err);
    return c.json({ 
      error: "Failed to generate weekly resume" 
    }, 500);
  }
})
.get("/sampleDataChat",async(c)=>{

        // Call your utility function
        const response = await GenTemplate();
      
        // Log the response from GenNewLg
        return c.json({data:response})

})
.post("/createProfil",zValidator("json",
    z.object({
        name: z
          .string()
          .min(2, { message: 'Name must be at least 2 characters' })
          .max(50),
        age: z
          .number({
            required_error: 'Age is required',
          })
          .min(18, { message: 'Age must be at least 18' })
          .max(100, { message: 'Age must be at most 100' }),
        occupation: z
          .string()
          .min(2, { message: 'Occupation must be at least 2 characters' })
          .max(50),
        familyStatus: z.enum(['single', 'married', 'married_with_children'], {
          required_error: 'Family Status is required',
        }),
        incomeLevel: z.number().min(0).optional(),
        locationType: z.enum(['urban', 'suburban', 'rural']).optional(),
        spendingBehavior: z.enum(['frugal', 'balanced', 'spendthrift']).optional(),
        additionalInfo: z.string().optional(), // Added field to schema
        monthlyRent: z.number().min(0).optional(),
        monthlySavings: z.number().min(0).optional(),
        riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
        creditCards: z.enum(['rarely', 'moderate', 'frequent']).optional(),
        workSchedule: z.enum(['regular', 'shift', 'flexible']).optional(),
        transportation: z.enum(['car', 'public', 'mixed']).optional(),
        diningPreference: z.enum(['homeCook', 'mixed', 'eatOut']).optional(),
        shoppingHabits: z.enum(['planner', 'mixed', 'impulsive']).optional(),
      })
),async (c) => {
  c.header('Content-Type', 'text/event-stream');
  c.header('Cache-Control', 'no-cache');
  c.header('Connection', 'keep-alive');
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  const limit = pLimit(5)
  const data = c.req.valid("json")
  
  let cleanup: (() => Promise<void>) | null = null

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial status
        controller.enqueue(createSSEMessage('extendPersona', {
          step: 'extendPersona',
          status: "running",
          message: 'Extending persona...'
        }))

        // Store active connections for cleanup
        const activeConnections: Set<any> = new Set()
        cleanup = async () => {
          for (const conn of activeConnections) {
            await conn.destroy()
          }
          activeConnections.clear()
        }


          const guideLine = await PersonaExtender(data);

  
          controller.enqueue(createSSEMessage('extendedPersona', {
            step: 'extendPersona',
            status: "completed",
            message: 'persona definition complete',
            data: guideLine
          }))
  
          // Data generation phase
          controller.enqueue(createSSEMessage('fiDataGenerationStart', {
            step: 'fiDataGeneration',
            status: "running",
            message: 'generating data...'
          }))


          const response  = await DataGenerator(guideLine);
          

         controller.enqueue(createSSEMessage('fiDataGenerationEnd', {
          step: 'fiDataGeneration',
          status: "completed",
          message: 'generation complete'
        }))

        // Transaction processing
        const personaId = createId()
        controller.enqueue(createSSEMessage('updatingFiDataStart', {
          step: 'updatingFiData',
          status: "running",
          message: 'updating transactions'
        }))
          const d =  await uploadEntitiesAndReplaceReferences(response,personaId)
          

          if (typeof d ==="string"){

            throw new Error(d)
          }

          for (const week of d) {
            for (const transaction of week.transactions) {
              const detailsTransaction = transaction["detailsTransactions"];
              const { detailsTransactions, ...transacToUp } = transaction;
              const timestamp = Date.parse(transacToUp.date);
          
              try {
                const responseTransaction = await client.api.transactions.$post(
                  { json: { ...transacToUp,
                    amount:convertAmountToMiliunits(transacToUp.amount),
                    date: new Date(timestamp) } },
                  {
                    headers: {
                      'X-Persona-ID': personaId,
                    },
                  }
                );
          
                const { data } = await responseTransaction.json();
          
                if (detailsTransaction) {
                  let completeDetailsTransaction = await Promise.all(
                    detailsTransaction.map((d) =>
                      limit(async () => {
                        try {
                          const responseDetail = await client.api.detailsTransactions.$post(
                            {
                              json: { ...d,
                                amount:convertAmountToMiliunits(d.amount),
                                unitPrice:d.unitPrice?convertAmountToMiliunits(d.unitPrice):d.unitPrice,
                                transactionId: data.id },
                            },
                            {
                              headers: {
                                'X-Persona-ID': personaId,
                              },
                            }
                          );
          
                          const ress = await responseDetail.json();
                          return ress;
                        } catch (err) {
                          console.error(err);
                        }
                      })
                    )
                  );
                }
              } catch (err) {
                console.error(err);
              }
            }
          }
          

       
        controller.enqueue(createSSEMessage('updatingFiDataEnd', {
          step: 'updatingFiData',
          status: "completed",
          message: 'updating transactions'
        }))

        controller.enqueue(createSSEMessage('complete', {
          step: "complete",
          status: "completed",
          message: 'Processing complete',
          data: personaId
        }))
        
      } catch (err: any) {


        controller.enqueue(createSSEMessage('error', { 
          message: err.message,
          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }))

        throw err
      } finally {
        if (cleanup) {
          await cleanup()
        }
        controller.close()
      }
    },

    cancel() {
      // Handle stream cancellation
      if (cleanup) {
        cleanup().catch(console.error)
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
})

export default conversation

