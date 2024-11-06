import { RunnableSequence} from "@langchain/core/runnables"
import {ChatOpenAI} from "@langchain/openai"
import {ChatPromptTemplate,MessagesPlaceholder} from "@langchain/core/prompts"
import { subMonths, startOfMonth, addWeeks } from 'date-fns'

import { z } from "zod"
import { StringOutputParser, StructuredOutputParser } from "@langchain/core/output_parsers"
import { AIMessage,BaseMessage,HumanMessage } from "@langchain/core/messages"



const model = new ChatOpenAI({
    model: "gpt-4o",
    apiKey: "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"
  });

  const formSchema = z.object({
    name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters' })
      .max(50)
      .nonempty({ message: 'Name is required' }),
    age: z
      .number({
        required_error: 'Age is required',
      })
      .min(18, { message: 'Age must be at least 18' })
      .max(100, { message: 'Age must be at most 100' }),
    occupation: z
      .string()
      .min(2, { message: 'Occupation must be at least 2 characters' })
      .max(50)
      .nonempty({ message: 'Occupation is required' }),
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

  type Form = z.infer<typeof formSchema>

// Define the schema for `detailsTransactions`
const detailsTransactionsSchema = z.object({
  name: z.string().nullable(),
  quantity: z.number().nullable(),
  unitPrice: z.number().nullable(),
  amount: z.number(),
  categoryId: z.string().nullable(),
  projectId: z.string().nullable(),
});

// Define the schema for `TransactionInterface`, which includes `detailsTransactions`
const TransactionInterfaceSchema = z.array(z.object({
  amount: z.number(),
  detailsTransactions: z.array(detailsTransactionsSchema),
  account: z.string(),
  payee: z.string(),
  notes: z.string().nullable(),
  date: z.string().nullable(),
  projectId: z.string().nullable(),
  accountId: z.string(),
  categoryId: z.string().nullable(),
}));


  const parserExemple = StructuredOutputParser.fromZodSchema(formSchema)

  const parserDataschema = StructuredOutputParser.fromZodSchema(TransactionInterfaceSchema)

export const GenTemplate  = async ()=>{

  
    const formatInstructions = `Respond only in valid JSON. The JSON object you return should match the following schema:
  
    const zodSchema = z.object({
    name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters' })
      .max(50)
      .nonempty({ message: 'Name is required' }),
    age: z
      .number({
        required_error: 'Age is required',
      })
      .min(18, { message: 'Age must be at least 18' })
      .max(100, { message: 'Age must be at most 100' }),
    occupation: z
      .string()
      .min(2, { message: 'Occupation must be at least 2 characters' })
      .max(50)
      .nonempty({ message: 'Occupation is required' }),
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
  })`
    
  
const SystemPrompt=`
you role is to generate random  informations  in order to create a persona. these informations will be used after for generating financial data.
        response in a JSON format
        The format of the JSON should be:
    tags\n{format_instructions}
`
    
    
        const memoryPrompt =await  ChatPromptTemplate.fromMessages([
            ["system",SystemPrompt],
            ["human","{input}"],
        ]).partial({
            format_instructions: formatInstructions,
          })
        
        const genLchain = RunnableSequence.from([
            memoryPrompt,
            model,
            parserExemple
        ])
    
        const response = await genLchain.invoke({
            input:"generate new persona"
        })
        
        console.log(response)
    
        return response
  
  }

export const DataGenerator = async ( data : Form ) => {

  const persona = JSON.stringify(data)
  console.log(persona)

const moreDetails = `i want to provide you with more informations.

 1. define all the bank which will be used. the need to be real bank . the can be physic Bank or online Bank . you can also use payment processor like Paypal.
 2. each persona depending on the profile must have principal Bank and all other Bank must be furnished exclusivily from these main Bank. that means the recharge a secondary Bank or Payment processor  money need to get out from the main account and come in the secound accound. transactions need to be created to reflect this .

3. maintain consistency accross all the categories you generates.
4. more information about the output elements.

1. **DetailsTransactions Structure**:
    
    - **DetailsTransactions** break down a parent transaction into its components like purchased items, quantities, and prices. This structure enables a **one-to-many relationship**, allowing a single transaction to capture detailed line items, such as different grocery items in one purchase.
2. **Generate Daily Financial Transactions**:
    
    - Simulate a set of daily financial transactions that mirror the expanded persona's lifestyle, cultural influences, and financial habits.

### Relationship between projects and transactions

- **Projects** group related expenses under a specific goal like a vacation or hobby. Transactions within a project share a projectId, demonstrating a **one-to-many relationship** where a project encompasses several related transactions over time.

### Relationship between projects and detailsTransactions

- **DetailsTransactions** can also be linked to a project using the projectId. This allows for a **many-to-many relationship** where project-related details from multiple transactions are captured under one project, such as various components in a "Build PC Gaming" project.


Your instructions are mostly clear, and here’s a refined summary to ensure everything is captured as intended. Let me know if you want to add any further details.

### Refined Instructions for Financial Transaction Generation

1. **Define All Banks**:
    
    - Use only real banks, which can include both physical banks and online banks. Also, payment processors like PayPal are valid options.
2. **Primary and Secondary Banks for Personas**:
    
    - Each persona has a primary bank account. Any transactions involving secondary banks or payment processors must be funded from this primary account. For example, if a persona transfers funds to PayPal, it must first be withdrawn from the primary bank.
3. **Category Consistency**:
    
    - Maintain consistent categories across all generated transactions.
4. **Output Elements Structure**:
    
    - **DetailsTransactions Structure**:
        
        - The DetailsTransactions schema breaks down parent transactions into individual items, quantities, and prices, creating a **one-to-many relationship** where one transaction can represent multiple items.
    - **Generate Daily Financial Transactions**:
        
        - Simulate daily financial activities that reflect each persona’s lifestyle, cultural background, and financial habits.
5. **Relationship Between Projects and Transactions**:
    
    - Projects encapsulate related expenses under a specific goal (e.g., a vacation or hobby). Transactions within a project share a projectId, creating a **one-to-many relationship**.
6. **Relationship Between Projects and DetailsTransactions**:
    
    - DetailsTransactions can also be associated with a projectId, creating a **many-to-many relationship** where individual transaction items belong to a broader project, like components within a "Build PC Gaming" project.

Let me know if this clarification helps or if you’d like to add more specific instructions.

exemple of output:

[{ "accountId": "commerzbank", "amount": -450000, "payee": "Airline Service", "date": "2024-04-15T09:30:00Z", "notes": "Flight to Bangkok", "categoryId": "travel", "projectId": "Bangkok_Trip", "detailsTransactions": [ { "amount": 450000, "name": "Round-trip ticket", "categoryId": "flight", "quantity": 1, "unitPrice": 450000, "projectId": "Bangkok_Trip" } ] }, { "accountId": "paypal", "amount": -120000, "payee": "Travel Gear Store", "date": "2024-04-16T13:45:00Z", "notes": "Luggage purchase", "categoryId": "shopping", "projectId": "Bangkok_Trip", "detailsTransactions": [ { "amount": 120000, "name": "Suitcase", "categoryId": "luggage", "quantity": 1, "unitPrice": 120000, "projectId": "Bangkok_Trip" } ] }, { "accountId": "paypal", "amount": -35000, "payee": "Café Kultur", "date": "2024-04-09T16:30:00Z", "notes": "Catching up with friends", "categoryId": "dining", "projectId": null, "detailsTransactions": [ { "amount": 20000, "name": "Latte Macchiato", "categoryId": "drink", "quantity": 4, "unitPrice": 5000, "projectId": null }, { "amount": 15000, "name": "Cheesecake Slice", "categoryId": "food", "quantity": 3, "unitPrice": 5000, "projectId": null } ],....(more) ]`


    const MEMORY_KEY = "chat_history"
    let transactionData = []
    let History : BaseMessage [] = [new HumanMessage(moreDetails),new AIMessage(`Thank you for the comprehensive information! Here’s a structured breakdown based on the provided system prompt and additional guidelines. Let me know if there’s anything more specific to fine-tune.

`)]
  
    const formatInstExtender = `Respond only in valid JSON. The JSON object you return should match the following schema:
  
    const zodSchema = z.array(
      z.object({
    amount: z.number(),
    detailsTransactions:
        z.array(z.object({
          name: z.string().nullable(),
          quantity: z.number().nullable(),
          unitPrice: z.number().nullable(),
          amount: z.number(),
          categoryId: z.string().nullable(),
          projectId: z.string().nullable(),
        })),
    account: z.string(),
    payee: z.string(),
    notes: z.string().nullable(),
    date: z.string(),
    projectId: z.string().nullable(),
    accountId: z.string(),
    categoryId: z.string().nullable(),
  });
) 
    `

    const SysPromptExtender =`You are an advanced AI specializing in persona development, cultural analysis, and financial behavior simulation. Your task is :
    1. **Expand the Provided Persona Information:**
      - Generate a comprehensive and detailed persona description based on the input information.
      - Ensure the description includes cultural background, demographics, psychographics, behavioral aspects, challenges, and goals.

    **Instructions:**

    ### Part 1: Expanded Persona Description

    1. **Introduction:**
      - Start with the persona's name and a brief summary of their background.

    2. **Cultural Background:**
      - Ethnicity and nationality
      - Cultural traditions and practices
      - Language(s) spoken
      - Religion or belief systems
      - Societal norms and values

    3. **Demographics:**
      - Age, gender, and marital status
      - Education level
      - Occupation and career path
      - Geographic location and living environment

    4. **Psychographics:**
      - Personality traits
      - Interests and hobbies
      - Lifestyle and daily routines
      - Motivations and aspirations
      - Attitudes and beliefs

    5. **Behavioral Aspects:**
      - Consumer behavior and purchasing habits
      - Media consumption preferences
      - Social interactions and relationship dynamics
      - Decision-making processes

    6. **Challenges and Pain Points:**
      - Common obstacles faced
      - Needs and desires unmet
      - Frustrations and sources of stress

    7. **Goals and Objectives:**
      - Short-term and long-term goals
      - Professional and personal aspirations
      - Desired outcomes and success criteria
  `

    const extenderPrompt = ChatPromptTemplate.fromMessages([
      ["system",SysPromptExtender],
      ["human","{input}"],
  ])

    const genPrompt = `You are an advanced AI specialized in simulating realistic daily financial transactions based on detailed persona information. Your primary objective is to generate a comprehensive set of daily financial transactions that accurately reflect the persona's cultural background, lifestyle, spending habits, income, expenses, financial goals, and behavioral aspects.

    ### **Inputs Provided:**
    - **Expanded Persona Description:** A detailed narrative that includes cultural background, demographics, psychographics, behavioral aspects, challenges, and goals of the persona.

    ### **Your Tasks:**

    1. **Understand the Persona:**
      - Analyze the provided expanded persona description thoroughly.
      - Identify key aspects such as income sources, spending habits, cultural practices, lifestyle preferences, financial goals, and any unique financial behaviors.

    2. **Generate Daily Financial Transactions:**
      - you will output weekly transaction data ONLY in JSON format, reflecting realistic, consistent, and varied spending patterns. Follow the structure closely (more information at the bottom of this message).
      - Ensure that each transaction aligns with the persona's characteristics and circumstances.
      - Important : there is NO limit how much transaction you can generate for a single Day.

    3. **Ensure Cultural and Behavioral Alignment:**
      - Incorporate cultural practices and traditions that may influence spending (e.g., festival expenses, traditional purchases).
      - Reflect the persona’s lifestyle choices, such as dining preferences, entertainment activities, and shopping habits.
      - Align transactions with the persona’s financial goals and challenges (e.g., savings efforts, investment activities).

    4. **Maintain Realism and Plausibility:**
   - Ensure that the frequency and amount of transactions are realistic based on the persona’s income and lifestyle.
   - Vary transaction types to include both recurring and one-time expenses.
   - Incorporate occasional unexpected expenses to enhance realism (e.g., medical bills, urgent repairs).

    5. **Formatting and Clarity:**
      - Ensure consistency in date formatting and currency representation.

    4. **Structure the Output:**
      tags\n{format_instructions}
        ` 

    const extenderChain = RunnableSequence.from([
      extenderPrompt,
      model,
      new StringOutputParser()
  ])

  const guideLine = await extenderChain.invoke({
    input:`generate a more detailed persona for ${persona}`
  })

  console.log(guideLine)

  const currentDate = new Date();
  const threeMonthsBefore = subMonths(currentDate, 3);
  const startOfThreeMonthsBefore = startOfMonth(threeMonthsBefore);
  const oneWeekAfter = addWeeks(startOfThreeMonthsBefore, 1);


  const dataGenPrompt = await  ChatPromptTemplate.fromMessages([
    ["system",genPrompt],
    new MessagesPlaceholder(MEMORY_KEY),
    ["human","{input}"],
  ]).partial({
    format_instructions: formatInstExtender,
  })

    const dataGenChain = RunnableSequence.from([
  dataGenPrompt,
  model,
  parserDataschema
])

const input = `
  IMPORTANT: Start generating the Transaction data. no need of Sample Data. Begin with the first week. your output must not have any surarounding text. 

  genrate the weekly data starting from this date: ${startOfThreeMonthsBefore}
  Persona: ${guideLine}
`

for (let week = 0; week < 3; week++){



   const weekData = await dataGenChain.invoke({
    input:week === 0 ? input : `generate the next week . carefully respect the output format `,
    chat_history:History
   })

   console.log(weekData)

  History.push(new HumanMessage("next week"))
  History.push(new AIMessage(JSON.stringify(weekData)))

  }
}

