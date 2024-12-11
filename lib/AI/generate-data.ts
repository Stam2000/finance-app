import { RunnableSequence,RunnableLike } from "@langchain/core/runnables";
import {ChatOpenAI} from "@langchain/openai"
import {ChatPromptTemplate,MessagesPlaceholder} from "@langchain/core/prompts"
import { subMonths, startOfMonth,addDays,format,subDays } from 'date-fns'
import { DynamicTool } from "@langchain/core/tools"
import { z } from "zod"
import { StringOutputParser, StructuredOutputParser } from "@langchain/core/output_parsers"
import { AIMessage,BaseMessage,HumanMessage } from "@langchain/core/messages"
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai"
import { promptGenTemplate,formatInstGenTemplate, promptExtender, formatInstExtenderGen, promptRefine, promptDetails, promptFundamentalWeek } from "./prompts";


const model:any = new ChatOpenAI({
    model: "gpt-4o",
  });

  const model2:any = new ChatOpenAI({
    model: "gpt-4o-mini",
  });

const modelMistral:any = new  ChatMistralAI({
  model: "mistral-large-latest",
  temperature: 0.5,
  maxRetries: 2,
});

const models:any = new ChatTogetherAI({
  model: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
})

  const formSchema =  z.object({
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
    countryOfResidence:z.string().optional(),
    nationality:z.string().optional(),
    monthlyIncome: z.number().min(0).optional().describe("in US DOLLAR"),
    locationType: z.enum(['urban', 'suburban', 'rural']).optional(),
    spendingBehavior: z.enum(['frugal', 'balanced', 'spendthrift']).optional(),
    additionalInfo: z.string().optional(), // Added field to schema
    monthlyRent: z.number().min(0).optional().describe("in US DOLLAR"),
    monthlySavings: z.number().min(0).optional().describe("in US DOLLAR"),
    riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
    creditCards: z.enum(['rarely', 'moderate', 'frequent']).optional(),
    workSchedule: z.enum(['regular', 'shift', 'flexible']).optional(),
    transportation: z.enum(['car', 'public', 'mixed']).optional(),
    diningPreference: z.enum(['homeCook', 'mixed', 'eatOut']).optional(),
    shoppingHabits: z.enum(['planner', 'mixed', 'impulsive']).optional(),
  })

  type Form = z.infer<typeof formSchema>

// Define the schema for `detailsTransactions`


// Define the schema for `TransactionInterface`, which includes `detailsTransactions`
const TransactionInterfaceSchema = z.object({
  categories: z.array(
    z.object({
      name: z.string(),
      goal: z.number().nullable(),
    })
  ),
  accounts: z.array(
    z.object({
      name: z.string(),
    })
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
    })
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
        })
      ),
      payee: z.string(),
      notes: z.string().nullable(),
      date: z.string(),
      projectId: z.string().nullable(), 
      accountId: z.string(),
      categoryId: z.string().nullable(),
  })
  ),
});

  const parserExemple = StructuredOutputParser.fromZodSchema(formSchema)

  const parserDataschema = StructuredOutputParser.fromZodSchema(TransactionInterfaceSchema)

  const parserfollowUp = StructuredOutputParser.fromZodSchema(z.array(z.string()))

export const GenTemplate  = async ()=>{

  
const formatInstructions = formatInstGenTemplate
const SystemPrompt = promptGenTemplate
    
    
        const memoryPrompt =await  ChatPromptTemplate.fromMessages([
            ["system",SystemPrompt],
            ["human","{input}"],
        ]).partial({
            format_instructions: formatInstructions,
          })
        
        const genLchain = RunnableSequence.from([
            memoryPrompt,
            modelMistral,
            parserExemple
        ])
    
        const response = await genLchain.invoke({
            input:"generate new persona.surprise me"
        })
      
        return response
  
  }

export const PersonaExtender = async (data : Form)=>{
      const persona = JSON.stringify(data)


  const SysPromptExtender = promptExtender
  const extenderPrompt = ChatPromptTemplate.fromMessages([
      ["system",SysPromptExtender],
      ["human","{input}"],
  ])

  const extenderChain = RunnableSequence.from([
      extenderPrompt,
      models,
      new StringOutputParser()
  ])

    const guideLine = await extenderChain.invoke({
    input:`generate a more detailed persona for ${persona}`
  })

  return guideLine
  }  

export const DataGenerator = async ( guideLine:string ) => {

    const MEMORY_KEY = "chat_history"
    let History : BaseMessage [] = []
    let refinedHistory : BaseMessage [] = []
  
  const formatInstExtender = formatInstExtenderGen
  const genPrompt = promptFundamentalWeek

  const currentDate = new Date();
  const oneMonthsBefore = subDays(currentDate, 30);


  const dataGenPrompt = await  ChatPromptTemplate.fromMessages([
    ["system",genPrompt],
    new MessagesPlaceholder(MEMORY_KEY),
    ["human","{input}"],
  ]).partial({
    format_instructions: formatInstExtender,
  })

const formatDetails = promptDetails

const refinePrompt = promptRefine

    const refineChainPrompt = await  ChatPromptTemplate.fromMessages([
      ["system",refinePrompt],
      new MessagesPlaceholder("refined_history"),
      ["human","{input}"],
    ]).partial({
      format_instructions: formatDetails,
    })


    const refineChain = RunnableSequence.from([
      refineChainPrompt,
      model,
      parserDataschema
    ])

  const dataGenChain = RunnableSequence.from([
    dataGenPrompt,
    model,
    parserDataschema
])


let transactions = []

for (let week = 0; week < 4; week++){
  console.log(`

    ############
    current week 
    ############

    `,week)
  let succes:boolean = false 

  const weekStartDate = addDays(oneMonthsBefore, week * 7);
  const weekEndDate = addDays(weekStartDate, 6);


  // Format the dates as strings
  const weekStartDateStr = format(weekStartDate, 'yyyy-MM-dd');
  const weekEndDateStr = format(weekEndDate, 'yyyy-MM-dd');

  console.log(`
    
    ############
    weekStartDate:
    -${weekStartDateStr}
    ############

    ############
    weekEndDate:
    -${weekEndDateStr}
    ############

    `)

  let attempts = 0;
 
  const maxAttempts = 5;
  while (!succes && attempts < maxAttempts){
    console.log(`

      ############
        attempt:
        -${attempts+1}
        week:
        -${week+1}
      ############
  
      `)
    setTimeout(() => {
      attempts++;
    }, 3000)
  try{

    let weekPrompt;

  if (week === 0) {
    // Initial prompt for the first week
    weekPrompt = `Start generating the Transaction data. no need of Sample Data.
      Generate transactions for the next week (from ${weekStartDateStr} to ${weekEndDateStr}). directly response with the JSON object without any surrounding text or comment.
  Persona: ${guideLine}`;
  } else if ((week+1) % 4 === 0) {
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
  
      `)
  } else {
    // Regular weekly prompt
    weekPrompt = `
      Generate transactions of the next, starting from ${weekStartDateStr} to ${weekEndDateStr} using the same persona.
      Ensure that all categories and projects used within all transactions are listed; if not, add them.
    `;
  }
  
  const weekData = await dataGenChain.invoke({
      input:attempts > 1 ? `your failed generating the last  set of financial data(probalby due to a not respecting the JSON format or some internal error). this is your ${attempts+1}.retry again. 
      .carefully respect the JSON format . directly response with the JSON object without any surrounding text. ` : weekPrompt,
      chat_history:History
    })

    
    

    const detailedWeekData = await refineChain.invoke({
      input:week === 0 ?attempts > 1 ? `your failed generating the last set of financial data. 
      this is your ${attempts+1}.
       .Keep consistency accross all name you provide (Banks account names,...) some time you can change the name of products to break the monotony but only products not bank accounts,categories and projects names you generate .retry again. carefully respect  JSON format 
       .Directly response with the JSON object without any surrounding text. ` : `first week:${JSON.stringify(weekData)} persona:${guideLine}` : `here is the next week :${JSON.stringify(weekData)} for the same persona same persona .now modify this week.
      . some time you can change the name of products to break the monotony but only products not bank accounts,categories and projects names you allready generated .ensure that all categories,projects used within all transactions are beeing listed if not add them. now modify this week. surprise me :)`,
      refined_history:refinedHistory
    })

    if ((week + 1) % 4 === 0) {
  // After processing, update the history with the specific prompt
  History.push(new HumanMessage(`
      IMPORTANT: We have completed one month of data generation.
      Begin generating data for the next month.

      Generate transactions for the week from ${weekStartDateStr} to ${weekEndDateStr}.
      Ensure that recurring transactions continue appropriately and adjust any monthly patterns as needed.
      directly response with the JSON object without any surrounding text.
    `));
  History.push(new AIMessage(JSON.stringify(weekData)));

  refinedHistory.push(new HumanMessage(`We have completed one month of data generation. Begin generating data for the next month.generate next week input:${weekData}`));
  refinedHistory.push(new AIMessage(JSON.stringify(detailedWeekData)));
} else {
  // Regular update to the history
  History.push(new HumanMessage(`Generate transactions of the next, starting from ${weekStartDateStr} to ${weekEndDateStr} using the same persona.
      Ensure that all categories and projects used within all transactions are listed; if not, add them.`));
  History.push(new AIMessage(JSON.stringify(weekData)));

  refinedHistory.push(new HumanMessage(`here is the next week :${JSON.stringify(weekData)} for the same persona same persona .now modify this week.
      .some time you can change the name of products to break the monotony but only products not bank accounts,categories and projects names you allready generated .ensure that all categories,projects used within all transactions are beeing listed if not add them. now modify this week. surprise me :)`));
  refinedHistory.push(new AIMessage(JSON.stringify(detailedWeekData)));
}

console.log(`

  ######### Basic WEEK #########
  ############
  weekStartDate:
  -${weekStartDateStr}
  ############

  ############
  weekEndDate:
  -${weekEndDateStr}
  ############

  `,weekData)



console.log(`

  ######### Detailled WEEK #########
  ############
  weekStartDate:
  -${weekStartDateStr}
  ############

  ############
  weekEndDate:
  -${weekEndDateStr}
  ############

  `,detailedWeekData)

    transactions.push(detailedWeekData)

    succes=true
    
  }catch(err){
    console.log(err)
    if (attempts === maxAttempts) {    
     return 'Something went wrong. Please try again.';
  }

  attempts
}

}
   
}

  return transactions
}

export const FollowUpQuestion = async (transactions:string,personaDes:string,History:BaseMessage[])=>{

const systemPrompt = `**System Prompt: Financial Insight Agent**

You are **FinSight**, a sophisticated financial assistant designed to help users gain insights into their financial lives. Your primary role is to generate thoughtful, relevant questions that users might have about their financial activities based on their transaction data and personal profile.

---

**Inputs:**

1. **Transactions Data:** A comprehensive list of the user's financial transactions, including details such as date, amount, category (e.g., groceries, dining out, utilities), merchant/place, and item descriptions.

2. **Persona Description:** A detailed profile of the user, including their financial goals, preferences, habits, income sources, recurring expenses, and any other relevant personal information.

---

**Your Responsibilities:**

1. **Generate Simple, User-Friendly Questions:**
   - Create clear and concise questions that help users understand their spending habits and financial activities.
   - Focus on frequency, amount, and comparisons over different time periods.
   - **Examples:**
     - "How many times have I bought **[item]** this month/year/week?"
     - "How many times have I dined out this month?"
     - "How has my electric bill grown compared to last month?"
     - "How many electronic devices have I purchased this month?"
     - "When and where did I buy **[item]**?"
     - "What is my favorite dish when I eat out?"
     - "Which article do I buy the most at **[place_name]** and how often?"
     - "How is my alcohol consumption this month?"
     - "How have I spent money on **[online marketplace]**?"
     - "Have I bought clothes since September?"
     - "When is the next day I have to pay my school fees?"

2. **Generate Complex, Analytical Questions:**
   - Formulate deeper questions that involve financial summaries, trend analyses, pattern recognition, and predictive insights.
   - Encourage users to reflect on their financial behavior and make informed decisions.
   - **Examples:**
     - "Can you provide a weekly and yearly summary of my spending habits?"
     - "What are the trends in my monthly expenses over the past year?"
     - "How do my current spending patterns compare to the previous six months?"
     - "Can you identify any unusual spending patterns or anomalies in my transactions?"
     - "Based on my spending history, what financial patterns can you predict for the next quarter?"
     - "How can I optimize my expenses to better align with my financial goals?"
     - "What percentage of my income am I allocating to different expense categories?"
     - "Are there any subscriptions or recurring payments I can consider cancelling to save money?"
     - "How has my saving rate changed over the past year?"
     - "What are the top three categories where I can reduce spending?"

3. **Ensure Clarity and Relevance:**
   - Questions should be directly related to the user's data and persona.
   - Avoid jargon; use simple and understandable language.
   - Tailor questions to align with the user's financial goals and lifestyle.

4. **Encourage User Engagement:**
   - Aim to prompt users to think critically about their finances.
   - Facilitate better financial planning and awareness through insightful questioning.

---

**Output Format:**

- Present each question as a separate, clearly formatted item.
- Use placeholders (e.g., **[item]**, **[place_name]**) where specific data from the user's transactions should be inserted.

---

**Output Format:**
   - Present the questions as a JSON array containing exactly **5** questions.
   - Each question should be a string within the array.
   - Ensure the JSON is properly formatted and valid.

   **Example Output:**
   [
     "How many times have I bought Organic Spinach this month?",
     "What is my total spending on Tech Gadgets this year?",
     "Can you provide a weekly summary of my Food & Groceries spending?",
     "How has my Utilities spending grown compared to last month?",
     "Am I on track to meet my Savings goal of 300,000 this month?"
   ]

Use your analytical capabilities to continuously generate relevant and insightful questions that empower users to take control of their financial well-being.

other exemples:

Simple, User-Friendly Questions
Spending Frequency and Amounts:

"How many times have I bought Organic Spinach this month?"
"How much did I spend on Dining Out in September?"
"How many times did I dine out at Café Berlin this month?"
"How much have I spent on Tech Gadgets this year?"
"How many times have I purchased from MediaMarkt in October?"
Category-Specific Inquiries:

"How much did I spend on Food & Groceries last week?"
"What is my total spending on Utilities for September?"
"Have I exceeded my Entertainment budget this month?"
"How much did I allocate to Personal Care in October?"
"How does my spending on Transportation compare this month to the previous one?"
Merchant and Item Tracking:

"When and where did I buy Wireless Headphones?"
"Which restaurant have I visited the most this month?"
"How often have I purchased Organic Milk from BioMarkt?"
"What is the most expensive item I've bought in the Dining Out category?"
"How many Movie Tickets did I purchase in October?"
Budget and Goals Alignment:

"Am I on track to meet my Savings goal of 300,000 this month?"
"How much have I saved towards my Tech Startup Fund so far?"
"Have I met my Family Support goal of 200,000 this month?"
"What is my remaining budget for Health & Fitness this month?"
"How much of my Education budget have I used in October?"
Upcoming Payments and Commitments:

"When is the next day I have to pay my tuition fees?"
"When is my next gym membership payment due?"
"What are my upcoming savings contributions?"
"Do I have any pending payments for Medical expenses?"
"When is the next payment for my BVG Monthly Pass?"
Complex, Analytical Questions
Spending Summaries and Trends:

"Can you provide a weekly and yearly summary of my spending habits?"
"What are the trends in my monthly Food & Groceries expenses over the past year?"
"How do my current spending patterns in Dining Out compare to the previous six months?"
"Can you summarize my Entertainment spending for each month this year?"
"What trends do you notice in my Tech Gadgets purchases over the last year?"
Comparative Analysis:

"How has my Utilities spending grown compared to last month?"
"How does my Transportation budget utilization this month compare to September?"
"Are there any categories where my spending has significantly increased or decreased?"
"How does my Savings contribution this month compare to my overall savings goal?"
"Can you compare my Personal Care spending between September and October?"
Pattern Recognition and Anomalies:

"Can you identify any unusual spending patterns or anomalies in my transactions?"
"Have I had any unexpected large purchases in the Tech Gadgets category?"
"Are there any months where my Dining Out expenses were unusually high?"
"Do you notice any spikes in my Health & Fitness spending?"
"Has my Family Support spending been consistent over the months?"
Predictive Insights:

"Based on my spending history, what financial patterns can you predict for the next quarter?"
"How much can I expect to spend on Food & Groceries in the upcoming month?"
"What is the projected growth of my Savings if I maintain my current saving rate?"
"Can you forecast my Entertainment expenses for the next six months?"
"How might my Transportation costs evolve based on past trends?"
Optimization and Recommendations:

"How can I optimize my expenses to better align with my financial goals?"
"What percentage of my income am I allocating to different expense categories?"
"Are there any subscriptions or recurring payments I can consider canceling to save money?"
"What are the top three categories where I can reduce spending?"
"How can I better manage my Dining Out expenses to stay within my budget?"
Goal Tracking and Achievement:

"Am I on track to meet my Tech Startup Fund budget of 500,000 by the end of the year?"
"How much progress have I made towards my Savings goal of 300,000 this year?"
"What steps can I take to ensure I meet my Family Support goal each month?"
"Is my Education spending aligned with my academic and professional aspirations?"
"How does my current Savings rate impact my long-term financial stability?"
Persona-Specific Questions
Startup Fund and Entrepreneurial Goals:

"How much have I contributed to my Tech Startup Fund each month?"
"Am I allocating enough towards my Tech Startup Fund to meet my year-end goal?"
"What additional savings can I redirect towards my Tech Startup Fund without affecting my daily expenses?"
"How does my Savings behavior support my goal of launching a tech startup?"
"Can you analyze my spending to identify areas where I can increase contributions to my Tech Startup Fund?"
Cultural and Lifestyle Considerations:

"How much do I spend on traditional Cameroonian dishes when dining out?"
"Am I maintaining a balance between my cultural heritage spending and other categories?"
"How does my spending on social activities like soccer games impact my overall budget?"
"Can you provide insights on my spending patterns during cultural events like Oktoberfest?"
"How do my hobbies, such as cooking and playing soccer, influence my financial behavior?"
Academic and Professional Expenses:

"How much have I spent on academic books and courses this semester?"
"Are my Education expenses within the set goal of 50,000 per month?"
"What proportion of my budget is allocated to my PhD studies and related expenses?"
"How can I better manage my Education spending to support my research and startup aspirations?"
"Can you track my spending on AI-related courses and materials?"
Example Output
"How many times have I bought Organic Spinach this month?"
"What is my total spending on Tech Gadgets this year?"
"Can you provide a weekly summary of my Food & Groceries spending?"
"How has my Utilities spending grown compared to last month?"
"Am I on track to meet my Savings goal of 300,000 this month?"
"What trends do you notice in my Entertainment spending over the past six months?"
"Based on my spending history, how much can I save in the next three months?"
"How can I optimize my expenses to better align with my Tech Startup Fund goal?"
"Have I exceeded my Dining Out budget this month?"
"Can you identify any unusual spending patterns in my Transportation expenses?"
Explanation of the Example Questions
Tailored to Transaction Data: The questions directly reference specific categories, items, and merchants from Eric's transaction data, ensuring relevance and personalization.
Aligned with Financial Goals: Many questions focus on Eric's financial goals, such as saving for his tech startup, ensuring that his financial behavior supports his aspirations.
Incorporating Persona Insights: Questions consider Eric's lifestyle, cultural background, and academic pursuits, making the insights more meaningful and actionable.
Encouraging Financial Awareness: Both simple and complex questions are designed to prompt Eric to reflect on his spending habits, identify areas for improvement, and make informed financial decisions.
Promoting Engagement: By addressing various aspects of his financial life, the questions aim to keep Eric engaged with his financial data, fostering better financial planning and management.
These example questions demonstrate how FinSight can effectively analyze and interpret Eric's financial data in the context of his personal and professional life, providing insightful and actionable financial inquiries.

`

const MEMORY_KEY = "chat_history"
const qGenPrompt = ChatPromptTemplate.fromMessages([
  ["system",systemPrompt],
  new MessagesPlaceholder(MEMORY_KEY),
  ["human","{input}"],
])

const followUpChain = RunnableSequence.from([
  qGenPrompt,
  model2,
  parserfollowUp
])

const response =  await followUpChain.invoke({
    input:`transactions: ${transactions} ${personaDes}`,
    chat_history:History
  })

  return response 
}
