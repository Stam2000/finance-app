import { RunnableSequence,RunnableLike } from "@langchain/core/runnables";
import {ChatOpenAI} from "@langchain/openai"
import {ChatPromptTemplate,MessagesPlaceholder} from "@langchain/core/prompts"
import { subMonths, startOfMonth } from 'date-fns'
import { DynamicTool } from "@langchain/core/tools"
import { z } from "zod"
import { StringOutputParser, StructuredOutputParser } from "@langchain/core/output_parsers"
import { AIMessage,BaseMessage,HumanMessage } from "@langchain/core/messages"
import { InferResponseType,InferRequestType } from "hono"
import {client} from "@/lib/hono";
import axios from "axios"
import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai"
import { AgentExecutor, createToolCallingAgent } from "langchain/agents"
import { RunnableLambda } from "@langchain/core/runnables"


interface InputPorject  {
  name: string;
  budget: number;
  startDate: string;
  endDate: string;
  description?: string | undefined;
}
interface InputAccount {
  name:"string"
}
interface InputCategory {
  name: string;
  goal?: number | null | undefined;
}


const model:RunnableLike = new ChatOpenAI({
    model: "gpt-4o",
    apiKey: "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"
  });

  const model2:RunnableLike = new ChatOpenAI({
    model: "gpt-4o-mini",
    apiKey: "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"
  });

const models:any = new ChatTogetherAI({
  model: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
  togetherAIApiKey:"535719ace9b7b0a8066566bd075b52112da2087dd66592fa884a4e975d79b911"
})

  const formSchema = z.object({
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


// Define the schema for `TransactionInterface`, which includes `detailsTransactions`
const TransactionInterfaceSchema = z.object({
  categories: z.array(
    z.object({
      name: z.string(),
      goal: z.number().nullable().optional(),
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
      projectId: z.string().nullable().optional(), // Make optional
      accountId: z.string(),
      categoryId: z.string().nullable(),
  })
  ),
});

  const parserExemple = StructuredOutputParser.fromZodSchema(formSchema)

  const parserDataschema = StructuredOutputParser.fromZodSchema(TransactionInterfaceSchema)

  const parserfollowUp = StructuredOutputParser.fromZodSchema(z.array(z.string()))

export const GenTemplate  = async ()=>{

  
    const formatInstructions = `Respond only in valid JSON. The JSON object you return should match the following schema:
  
    const zodSchema = z.object({
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
    incomeLevel: z.number().min(0).optional(),(monthly)
    locationType: z.enum(['urban', 'suburban', 'rural']).optional(),
    spendingBehavior: z.enum(['frugal', 'balanced', 'spendthrift']).optional(),
    additionalInfo: z.string().optional(), 
    monthlyRent: z.number().min(0).optional(),
    monthlySavings: z.number().min(0).optional(),
    riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
    creditCards: z.enum(['rarely', 'moderate', 'frequent']).optional(),
    workSchedule: z.enum(['regular', 'shift', 'flexible']).optional(),
    transportation: z.enum(['car', 'public', 'mixed']).optional(),
    diningPreference: z.enum(['homeCook', 'mixed', 'eatOut']).optional(),
    shoppingHabits: z.enum(['planner', 'mixed', 'impulsive']).optional(),
  })
  `
    
  
const SystemPrompt=`
You are a specialized AI system designed to generate realistic financial profile. ensure that each attribute influences financial behaviors and decisions uniquely.
 strictly conform to the provided Zod schema
Instructions for Generating Personas:
-Adhere to Schema Constraints
 
ALL PRICE ARE IN US DOLLAR

Ensure each field meets the validation rules specified in the schema (e.g., age between 18 and 100, name length between 2 and 50 characters).
- Create diverse, realistic personas across different socioeconomic backgrounds
- Ensure internal consistency between all attributes
- Generate attributes that reflect real-world financial patterns and behaviors
- Include optional fields when they add value to the persona
- Maintain logical relationships between income, spending, and savings

Name: Use a wide range of names from different cultures and backgrounds.
Age: Cover various age groups (e.g., young adults, middle-aged, seniors).
Occupation: Include diverse professions across different industries and job levels.
Family Status: Mix between single, married, and married with children.
Country/Nationality: Represent multiple countries and nationalities to capture different economic environments.
Income Level: Vary income levels to reflect different financial capacities.
Location Type: Include urban, suburban, and rural residents.
Spending Behavior: Distribute among frugal, balanced, and spendthrift behaviors.
Risk Tolerance: Incorporate conservative, moderate, and aggressive investors.
Other Optional Fields: Fill optional fields where applicable to add depth and diversity.
Provide Relevant additionalInfo:

Use this field to include unique attributes or circumstances that influence financial behavior, such as "Recently started a new business" or "Planning to relocate internationally."
Ensure Realism:

Create plausible and coherent personas where attributes logically influence each other (e.g., a high-income individual might have higher monthly savings).

Below are a few sample personas that adhere to your schema and demonstrate diversity across different attributes.

{{
  "name": "Ayesha Khan",
  "age": 29,
  "occupation": "Graphic Designer",
  "familyStatus": "single",
  "countryOfResidence": "Canada",
  "nationality": "Pakistani",
  "incomeLevel": 4583.33,
  "locationType": "urban",
  "spendingBehavior": "balanced",
  "additionalInfo": "Freelances part-time for additional income.",
  "monthlyRent": 1200,
  "monthlySavings": 500,
  "riskTolerance": "aggressive",
  "creditCards": "frequent",
  "workSchedule": "flexible",
  "transportation": "public",
  "diningPreference": "eatOut",
  "shoppingHabits": "impulsive"
}},
{{
  "name": "Hiroshi Tanaka",
  "age": 65,
  "occupation": "Retired Teacher",
  "familyStatus": "married",
  "countryOfResidence": "Japan",
  "nationality": "Japanese",
  "incomeLevel": 2500,
  "locationType": "rural",
  "spendingBehavior": "frugal",
  "additionalInfo": "Enjoys gardening and volunteering at the local community center.",
  "monthlyRent": 0,
  "monthlySavings": 200,
  "riskTolerance": "conservative",
  "creditCards": "rarely",
  "workSchedule": "regular",
  "transportation": "mixed",
  "diningPreference": "homeCook",
  "shoppingHabits": "planner"
}},
{{
  "name": "Sophia Müller",
  "age": 38,
  "occupation": "Entrepreneur",
  "familyStatus": "married_with_children",
  "countryOfResidence": "Germany",
  "nationality": "German",
  "incomeLevel": 10000,
  "locationType": "urban",
  "spendingBehavior": "spendthrift",
  "additionalInfo": "Recently launched a tech startup focusing on AI solutions.",
  "monthlyRent": 2500,
  "monthlySavings": 3000,
  "riskTolerance": "aggressive",
  "creditCards": "frequent",
  "workSchedule": "flexible",
  "transportation": "car",
  "diningPreference": "eatOut",
  "shoppingHabits": "impulsive"
}},
{{
  "name": "Carlos Silva",
  "age": 52,
  "occupation": "Healthcare Administrator",
  "familyStatus": "married",
  "countryOfResidence": "Brazil",
  "nationality": "Brazilian",
  "incomeLevel": 5416.67,
  "locationType": "suburban",
  "spendingBehavior": "balanced",
  "additionalInfo": "Planning to fund children's higher education and invest in real estate.",
  "monthlyRent": 800,
  "monthlySavings": 1200,
  "riskTolerance": "moderate",
  "creditCards": "moderate",
  "workSchedule": "regular",
  "transportation": "mixed",
  "diningPreference": "mixed",
  "shoppingHabits": "planner"
}}

        
    response only in valid JSON format
    The format instructions:
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
            input:"generate new persona.surprise me"
        })
        
        console.log(response)
    
        return response
  
  }

export const PersonaExtender = async (data : Form)=>{
      const persona = JSON.stringify(data)
  console.log(persona)

  const SysPromptExtender =`You are an advanced AI specializing in persona development, cultural analysis, and behavioral modeling. Your task is to generate a richly detailed, coherent persona description based on the structured input provided. Follow the schema carefully, ensuring every field is expanded upon with specificity, logical consistency, and cultural authenticity.

Instructions
Field Mapping & Coverage

Ensure every field in the input schema is explicitly addressed in the output. Map fields to relevant sections to maintain logical coherence.
Expand each field systematically, avoiding omissions or underdeveloped areas. For example:
locationType → Geographic Location and Living Environment.
monthlySavings → Financial Planning and Behavior.
riskTolerance → Decision-Making and Investment Strategy.
Primary Cultural Anchor

Root the persona in a primary cultural and geographic context based on the schema.
Layer additional influences (e.g., cultural heritage, international exposure) in a way that enriches the persona but does not overshadow their primary identity.
Logical Interconnections

Build relationships between different fields for a cohesive narrative. For example:
Highlight how the persona’s occupation shapes their personality and lifestyle.
Show how their family status influences daily routines and financial behavior.
Balanced Global Diversity

Use diverse cultural references where relevant, but prioritize those consistent with the persona’s primary cultural context.
Incorporate specific, realistic examples (e.g., actual cities, cultural practices, organizations, or industries) to add depth and authenticity without overwhelming the narrative.
Coherence and Flow

Ensure smooth transitions between sections. Avoid standalone expansions that feel disjointed.
Structure the description logically, so each section builds upon the previous one.
Detailed Schema Expansion

Include all schema fields and ensure rich, contextualized descriptions. For instance:
Expand transportation by mentioning the type of vehicle and its relevance to the persona’s lifestyle.
For diningPreference, describe typical choices (e.g., “balances home-cooked meals and dining at eco-friendly restaurants”).
Post-Generation Quality Check

Verify that the description is complete, cohesive, and realistic.
Ensure consistency between demographic, cultural, and behavioral elements.
Output Structure
Introduction

Provide the persona’s full name, age, and a summary of their life, focusing on their demographic, occupation, family, and identity.
Highlight how these attributes shape their daily life.
Cultural Background

Ethnicity and Nationality: Describe the persona’s heritage and its impact on their life.
Cultural Traditions and Practices: Detail specific cultural rituals or holidays.
Language(s) Spoken: List languages with proficiency levels and contexts of use.
Religion or Belief Systems: Include religious practices or personal philosophies.
Societal Norms and Values: Highlight values shaped by their cultural and societal environment.
Demographics

Age, Gender, and Marital Status: Expand on family dynamics.
Education Level: Specify educational background with institutions and fields of study.
Occupation and Career Path: Describe their current role and career history, including relevant industries or employers.
Geographic Location and Living Environment: Provide specific details about their living area (urban, suburban, or rural) and its significance.
Psychographics

Personality Traits: Describe character attributes shaped by their experiences and occupation.
Interests and Hobbies: List specific hobbies or activities.
Lifestyle and Daily Routines: Provide a structured overview of their daily life, including work, leisure, and family time.
Motivations and Aspirations: Highlight short- and long-term goals.
Attitudes and Beliefs: Describe their worldview and values.
Behavioral Aspects

Consumer Behavior and Purchasing Habits: Explain spending habits with examples of typical purchases.
Media Consumption Preferences: Mention favorite platforms, genres, or sources of information.
Social Interactions and Relationship Dynamics: Detail their role in social circles or community activities.
Decision-Making Processes: Describe their approach to making decisions.
Challenges and Pain Points

Common Obstacles Faced: Include specific struggles or limitations.
Needs and Desires Unmet: Mention unfulfilled goals or aspirations.
Frustrations and Sources of Stress: Describe sources of stress in personal and professional life.
Goals and Objectives

Short-term Goals: List immediate plans or milestones.
Long-term Goals: Describe broader ambitions.
Professional and Personal Aspirations: Include measurable achievements they aim for.
Desired Outcomes and Success Criteria: Define how they measure success.
Key Requirements

Expand all schema fields with contextualized examples.
Use global diversity where applicable while maintaining a logical and realistic persona.
Final Note:
The goal is to create a detailed, relatable character firmly grounded in their cultural and professional context. Strive for authenticity and respectfulness while avoiding stereotypes. Ensure the persona is realistic, interconnected, and aligned with the input schema.
  `
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

  console.log(guideLine)
  return guideLine
  }  

export const DataGenerator = async ( guideLine:string ) => {
  console.log("ok")

    const MEMORY_KEY = "chat_history"
    let transactionData = []
    let History : BaseMessage [] = []
    let refinedHistory : BaseMessage [] = []
  
  const formatInstExtender = `Respond only in valid JSON. The JSON object you return should match the following schema:

  categories:contains an array which contains ALL the categories used so far in both transactions and detailsTransactions **WITHOUT EXCEPTION**
  accounts: represents ALL the accounts of the persona **WITHOUT EXCEPTION**
  projects: represents ALL the projects used so far in both transactions and detailsTransactions **WITHOUT EXCEPTION**
  
   FinancialDataSchema = z.object({
 categories: z.array(
 z.object({
 name: z.string(),
 goal: z.number().nullable().optional(), //represent the monthly limit expense oder the montly target to reach
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
 startDate: z.string(),
 }),
 endDate: z.string(),
 }),
 description: z.string().nullable().optional(),
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
 projectId: z.string().nullable().optional(), // Make optional
 accountId: z.string(),
 categoryId: z.string().nullable() ),

})

Comprehensive detailsTransactions:
For every transaction that includes a detailsTransactions field, provide a detailed breakdown of each individual item. This includes:
Name: The specific name of the item or service purchased.
Quantity: The number of units purchased.
Unit Price: The cost per unit of the item.
Amount: The total cost for that item (quantity multiplied by unit price).
CategoryId: The category to which this item belongs, ensuring it matches one of the listed categories.
ProjectId: If applicable, associate the item with a relevant project.
Specificity in Items:

  `
  
  const tools = [
    new DynamicTool({
      name:"create_account",
      description: "create a new account",
      func: async(input:string)=>{
        let json:InputAccount = await JSON.parse(input)
        try {
            const response = await axios.post("http://localhost:3000/api/accounts", json);
            return { data: response.data };
          } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : String(err) };
          }
        }
    }),
    new DynamicTool({
      name:"create_category",
      description: "create a new category",
      func: async(input:string)=>{
        let json:InputCategory = await JSON.parse(input)
        try {
            const response = await axios.post("http://localhost:3000/api/categories", json);
            return { data: response.data };
          } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : String(err) };
          }
        }
    }),
    new DynamicTool({
      name:"create_project",
      description: "create a new project",
      func: async(input:string)=>{
        let json:InputPorject = await JSON.parse(input)
        try {
            const response = await axios.post("http://localhost:3000/api/projects", json);
            return { data: response.data };
          } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : String(err) };
          }
        }
    }),
    new DynamicTool({
      name: "create_categories_bulk",
      description:  `Create multiple categories in bulk. expample input "{"input":[{"name":"electronic","goal":"40000"},{"name":"food","goal":"null"},...]}" `,
      func: async (input) => {
        const categories = JSON.parse(input); // Expecting an array of InputCategory
        const results = [];
    
        for (const category of categories) {
          try {
            const response = await axios.post("http://localhost:3000/api/categories", category);
            results.push({ data: response.data });
          } catch (err) {
            results.push({ success: false, error: err instanceof Error ? err.message : String(err) });
          }
        }
    
        return  results ;
      }
    }),
    new DynamicTool({
      name: "create_projects_bulk",
      description: `Create multiple projects in bulk . "{"input":[{"name":"electronic","goal":"40000"},{"name":"food","goal":"null"},...]}" `,
      func: async (input) => {
        const {input:projects} = JSON.parse(input);; // Expecting an array of InputProject
        const results = [];
    
        for (const project of projects) {
          try {
            const response = await axios.post("http://localhost:3000/api/projects", project);
            results.push({ data: response.data });
          } catch (err) {
            results.push({ success: false, error: err instanceof Error ? err.message : String(err) });
          }
        }
    
        return results ;
      }
    }),
    new DynamicTool({
      name: "create_accounts_bulk",
      description:`Create multiple accounts in bulk . expample input "{"input":[projet1's JSON obj,projet2's JSON obj,...]}" `,
      func: async (input) => {
        console.log(input)
        const {input:accounts} = JSON.parse(input); // Expecting an array of InputAccount
        const results = [];
        console.log(accounts)
    
        for (const account of accounts) {
          try {
            const response = await axios.post("http://localhost:3000/api/accounts", account);
            results.push({ data: response.data });
          } catch (err) {
            results.push({ success: false, error: err instanceof Error ? err.message : String(err) });
          }
        }
    
        return  results ;
      }
    })
  ]

const genPrompt = `
You are an advanced AI specialized in generating realistic and consistent daily financial transactions over time for a given persona. 
Your primary objective is to produce a comprehensive set of daily financial transactions that maintain consistency across different weeks, accurately reflecting recurring expenses, income patterns, and spending habits,
accurately reflect the persona's cultural background, lifestyle, spending habits, financial goals, and behavioral aspects.

YOU WILL ONLY WORK IN US DOLLAR. if the currency is not in US DOLLAR CONVERT IT

Your Tasks:
Understand the Persona's Financial Patterns:

Analyze the persona's income sources, recurring expenses, and financial commitments, 
cultural practices, lifestyle preferences, financial goals, and any unique financial behaviors, 
including preferences for specific types of financial institutions or services that align with their cultural background and geographical location.
Identify patterns in spending habits, such as weekly grocery shopping, monthly bills, and periodic investments.

Accounts: Each persona has a primary bank account. Any transactions involving secondary banks or payment processors must be funded from this primary account.
Projects: Group related expenses under specific goals like a vacation or hobby.

Incorporate cultural practices and traditions that may influence spending (e.g., festival expenses, traditional purchases).

Reflect the persona’s lifestyle choices, such as dining preferences, entertainment activities, and shopping habits.

Align transactions with the persona’s financial goals and challenges (e.g., savings efforts, investment activities).

Generate Consistent Transactions Over Time:

Ensure that recurring transactions occur at appropriate intervals (e.g., rent payments, utility bills, subscriptions).
Maintain consistency in transaction amounts for regular expenses, adjusting only for realistic variations (e.g., slight differences in utility bills).
Distribute expenses logically throughout the weeks to simulate real-life spending patterns.

Ensure that each transaction aligns with the persona's characteristics and circumstances.
Ensure that the total expenses do not exceed the persona's income over the period.
Maintain Realism and Plausibility:

Generate a sufficient number of transactions in alimentation-related categories (e.g., "Food & Groceries," "Dining Out") to realistically cover the nutritional needs of the persona and their household.
Take into account the persona's family size, dietary preferences, and lifestyle (e.g., preference for organic, locally sourced products, and balanced meals).
Include multiple weekly transactions for essential grocery shopping and occasional dining out that reflect a variety of food types, such as:
Fresh Produce: Fruits, vegetables, herbs.
Proteins: Meat, fish, eggs, legumes, dairy products.
Staples: Rice, pasta, bread, grains.
Snacks and Beverages: Healthy snacks, coffee, tea, juices.
Ensure that the total spending in alimentation categories aligns with the persona’s financial goals and monthly budget.

- **Ensure all outgoing transactions (expenses) are represented as negative amounts and all incoming transactions (income) as positive amounts.**

Vary transaction types to include both regular and one-time expenses.
Incorporate occasional unexpected expenses to enhance realism (e.g., medical bills, car repairs).
Adjust spending habits as needed to accommodate financial goals or unexpected expenses.
Ensure Temporal Consistency:

Accurately reflect dates for recurring transactions (e.g., salary on the first of the month, rent on a fixed date).
Adjust for weekends and holidays when transactions might be delayed or occur earlier.
Ensure that the timing of expenses aligns with the persona's cash flow to avoid negative balances.
Formatting and Clarity:

Output the transaction data ONLY in JSON format, following the provided schema.
Transactions Structure:

For transactions with detailsTransactions, include detailed breakdowns.
Maintain consistent use of accounts, categories, and projects across the transactions. List all used accounts, categories, and projects at the top of the output.
Budget Compliance:

Ensure that spending in each category does not exceed the set goals.
Adjust expenses as necessary to remain within budget constraints.
Note: Focus on the consistency, realism, and budget compliance of the financial transactions over time.


    7. **Structure the Output:**
      tags\n{format_instructions}


      exemple output two week week:  
the data are transactions rate, type of transactions highly depend in these exemple to the Persona. therefore don't take them as a accurte guide for the persona which you generate the transaction.

      {{
  "categories": [
    {{"name": "Rent", "goal": 250}},
    {{"name": "Groceries", "goal": 600}},
    {{"name": "Dining Out", "goal": 200}},
    {{"name": "Transportation", "goal": 150}},
    {{"name": "Utilities", "goal": 150}},
    {{"name": "Education", "goal": 300}},
    {{"name": "Entertainment", "goal": 100}},
    {{"name": "Books", "goal": 50}},
    {{"name": "Savings", "goal": 420}},
    {{"name": "Charity", "goal": 75}},
    {{"name": "Healthcare", "goal": 150}}
  ],
  "accounts": [
    {{"name": "Primary Bank Account"}}
  ],
  "projects": [
    {{
      "name": "Vacation Home Purchase",
      "budget": 200000,
      "startDate": "2023-01-01",
      "endDate": "2023-12-31",
      "description": "Invest in a vacation home in the Turkish countryside."
    }}
  ],
  "transactions": [
    {{
      "amount": -130,
      "detailsTransactions": [
        {{"name": "Organic Vegetables & Fruits", "quantity": 15, "unitPrice": 3, "amount": -45, "categoryId": "Groceries", "projectId": null}},
        {{"name": "Halal Meat", "quantity": 6, "unitPrice": 10, "amount": -60, "categoryId": "Groceries", "projectId": null}},
        {{"name": "Dairy Products", "quantity": 5, "unitPrice": 5, "amount": -25, "categoryId": "Groceries", "projectId": null}}
      ],
      "payee": "Local Market",
      "notes": "Purchase of weekly groceries",
      "date": "2023-11-08",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Groceries"
    }},
    {{
      "amount": -1200,
      "detailsTransactions": [
        {{"name": "Monthly Rent Payment", "quantity": 1, "unitPrice": 1200, "amount": -1200, "categoryId": "Rent", "projectId": null}}
      ],
      "payee": "Landlord",
      "notes": "Monthly rent for apartment",
      "date": "2023-11-01",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Rent"
    }},
    {{
      "amount": -50,
      "detailsTransactions": [],
      "payee": "Public Transport Top-Up",
      "notes": "Monthly transportation pass",
      "date": "2023-11-09",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Transportation"
    }},
    {{
      "amount": -100,
      "detailsTransactions": [],
      "payee": "Electricity Provider",
      "notes": "Monthly electricity bill",
      "date": "2023-11-10",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Utilities"
    }},
    {{
      "amount": -60,
      "detailsTransactions": [
        {{"name": "The Economist Subscription", "quantity": 1, "unitPrice": 60, "amount": -60, "categoryId": "Education", "projectId": null}}
      ],
      "payee": "Magazine Store",
      "notes": "Annual subscription renewal",
      "date": "2023-11-11",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Education"
    }},
    {{
      "amount": -30,
      "detailsTransactions": [],
      "payee": "Coffee Shop",
      "notes": "Arabic coffee with colleagues",
      "date": "2023-11-12",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Dining Out"
    }},
    {{
      "amount": -90,
      "detailsTransactions": [
        {{"name": "Documentary Streaming Service", "quantity": 1, "unitPrice": 15, "amount": -15, "categoryId": "Entertainment", "projectId": null}},
        {{"name": "Weekend Family Movie Night", "quantity": 1, "unitPrice": 75, "amount": -75, "categoryId": "Entertainment", "projectId": null}}
      ],
      "payee": "Streaming Platforms",
      "notes": "Family entertainment",
      "date": "2023-11-13",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Entertainment"
    }},
    {{
      "amount": -40,
      "detailsTransactions": [],
      "payee": "Charity Donation",
      "notes": "Monthly contribution to local charity",
      "date": "2023-11-14",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Charity"
    }}
  ]
}}

{{
  "categories": [
    {{ "name": "Rent", "goal": 250 }},
    {{ "name": "Groceries", "goal": 600 }},
    {{ "name": "Dining Out", "goal": 200 }},
    {{ "name": "Transportation", "goal": 150 }},
    {{ "name": "Utilities", "goal": 150 }},
    {{ "name": "Education", "goal": 300 }},
    {{ "name": "Entertainment", "goal": 100 }},
    {{ "name": "Books", "goal": 50 }},
    {{ "name": "Savings", "goal": 420 }},
    {{ "name": "Charity", "goal": 75 }},
    {{ "name": "Healthcare", "goal": 150 }}
  ],
  "accounts": [
    {{ "name": "Primary Bank Account" }}
  ],
  "projects": [
    {{
      "name": "Vacation Home Purchase",
      "budget": 200000,
      "startDate": "2023-01-01",
      "endDate": "2023-12-31",
      "description": "Invest in a vacation home in the Turkish countryside."
    }}
  ],
  "transactions": [
    {{
      "amount": -150,
      "detailsTransactions": [
        {{ "name": "Organic Produce", "quantity": 20, "unitPrice": 3, "amount": -60, "categoryId": "Groceries", "projectId": null }},
        {{ "name": "Fish & Poultry", "quantity": 5, "unitPrice": 10, "amount": -50, "categoryId": "Groceries", "projectId": null }},
        {{ "name": "Baked Goods", "quantity": 4, "unitPrice": 10, "amount": -40, "categoryId": "Groceries", "projectId": null }}
      ],
      "payee": "Organic Grocery Store",
      "notes": "Weekly groceries",
      "date": "2023-11-15",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Groceries"
    }},
    {{
      "amount": -40,
      "detailsTransactions": [],
      "payee": "Taxi Service",
      "notes": "Trip to Istanbul University",
      "date": "2023-11-16",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Transportation"
    }},
    {{
      "amount": -50,
      "detailsTransactions": [],
      "payee": "Water Utility",
      "notes": "Monthly water bill",
      "date": "2023-11-17",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Utilities"
    }},
    {{
      "amount": -100,
      "detailsTransactions": [],
      "payee": "Private Tutor",
      "notes": "French lessons for children",
      "date": "2023-11-18",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Education"
    }},
    {{
      "amount": -75,
      "detailsTransactions": [],
      "payee": "Local Turkish Restaurant",
      "notes": "Dinner with family friends",
      "date": "2023-11-19",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Dining Out"
    }},
    {{
      "amount": -35,
      "detailsTransactions": [
        {{ "name": "Family Board Game Night", "quantity": 1, "unitPrice": 35, "amount": -35, "categoryId": "Entertainment", "projectId": null }}
      ],
      "payee": "Toy Store",
      "notes": "Purchase of new board games",
      "date": "2023-11-20",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Entertainment"
    }},
    {{
      "amount": -45,
      "detailsTransactions": [],
      "payee": "Medical Checkup",
      "notes": "Routine health check-up",
      "date": "2023-11-21",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Healthcare"
    }},
    {{
      "amount": -250,
      "detailsTransactions": [
        {{ "name": "Monthly Apartment Rent", "quantity": 1, "unitPrice": 250, "amount": -250, "categoryId": "Rent", "projectId": null }}
      ],
      "payee": "Landlord",
      "notes": "Rent payment for November",
      "date": "2023-11-01",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Rent"
    }}
  ]
}}

exemple output 2 :

{{
  "categories": [
    {{ "name": "Rent", "goal": 800 }},
    {{ "name": "Utilities", "goal": 100 }},
    {{ "name": "Food & Groceries", "goal": 300 }},
    {{ "name": "Dining Out", "goal": 150 }},
    {{ "name": "Transportation", "goal": 100 }},
    {{ "name": "Entertainment", "goal": 100 }},
    {{ "name": "Health & Wellness", "goal": 50 }},
    {{ "name": "Savings", "goal": 200 }},
    {{ "name": "Professional Development", "goal": 150 }},
    {{ "name": "Miscellaneous", "goal": 50 }}
  ],
  "accounts": [
    {{ "name": "Main Bank Account" }}
  ],
  "projects": [
    {{
      "name": "Mid-Autumn Festival Celebration",
      "budget": 100,
      "startDate": "2023-09-21",
      "endDate": "2023-09-29",
      "description": "Expenses related to Mid-Autumn Festival traditions."
    }}
  ],
  "transactions": [
    {{
      "amount": -800,
      "detailsTransactions": [
        {{ "name": "Apartment Rent - September", "quantity": 1, "unitPrice": 800, "amount": -800, "categoryId": "Rent", "projectId": null }}
      ],
      "payee": "Jing’an Apartment Management",
      "notes": "Monthly rent payment for September",
      "date": "2023-09-16",
      "projectId": null,
      "accountId": "Main Bank Account",
      "categoryId": "Rent"
    }},
    {{
      "amount": -50,
      "detailsTransactions": [
        {{ "name": "Electricity Bill", "quantity": 1, "unitPrice": 30, "amount": -30, "categoryId": "Utilities", "projectId": null }},
        {{ "name": "Water Bill", "quantity": 1, "unitPrice": 20, "amount": -20, "categoryId": "Utilities", "projectId": null }}
      ],
      "payee": "SPDB",
      "notes": "Utility payments",
      "date": "2023-09-17",
      "projectId": null,
      "accountId": "Main Bank Account",
      "categoryId": "Utilities"
    }},
    {{
      "amount": -70,
      "detailsTransactions": [
        {{ "name": "Rice & Noodles", "quantity": 3, "unitPrice": 3, "amount": -9, "categoryId": "Food & Groceries", "projectId": null }},
        {{ "name": "Vegetables", "quantity": 10, "unitPrice": 2, "amount": -20, "categoryId": "Food & Groceries", "projectId": null }},
        {{ "name": "Chicken & Fish", "quantity": 4, "unitPrice": 4, "amount": -16, "categoryId": "Food & Groceries", "projectId": null }},
        {{ "name": "Fruits", "quantity": 10, "unitPrice": 2, "amount": -20, "categoryId": "Food & Groceries", "projectId": null }},
        {{ "name": "Tofu & Beans", "quantity": 2, "unitPrice": 2.5, "amount": -5, "categoryId": "Food & Groceries", "projectId": null }}
      ],
      "payee": "Fresh Local Market",
      "notes": "Weekly grocery shopping to maintain a balanced diet",
      "date": "2023-09-18",
      "projectId": null,
      "accountId": "Main Bank Account",
      "categoryId": "Food & Groceries"
    }},
    {{
      "amount": -10,
      "detailsTransactions": [
        {{ "name": "Transportation Card Recharge", "quantity": 1, "unitPrice": 10, "amount": -10, "categoryId": "Transportation", "projectId": null }}
      ],
      "payee": "Transportation Card",
      "notes": "Public transport top-up",
      "date": "2023-09-19",
      "projectId": null,
      "accountId": "Main Bank Account",
      "categoryId": "Transportation"
    }},
    {{
      "amount": -35,
      "detailsTransactions": [
        {{ "name": "Lunch Meal", "quantity": 1, "unitPrice": 35, "amount": -35, "categoryId": "Dining Out", "projectId": null }}
      ],
      "payee": "Sushi Express",
      "notes": "Lunch with colleagues",
      "date": "2023-09-20",
      "projectId": null,
      "accountId": "Main Bank Account",
      "categoryId": "Dining Out"
    }},
    {{
      "amount": -45,
      "detailsTransactions": [
        {{ "name": "Dietary Supplements", "quantity": 1, "unitPrice": 45, "amount": -45, "categoryId": "Health & Wellness", "projectId": null }}
      ],
      "payee": "Health Store",
      "notes": "Purchase of dietary supplements",
      "date": "2023-09-21",
      "projectId": null,
      "accountId": "Main Bank Account",
      "categoryId": "Health & Wellness"
    }},
    {{
      "amount": -20,
      "detailsTransactions": [
        {{ "name": "Art Museum Ticket", "quantity": 1, "unitPrice": 20, "amount": -20, "categoryId": "Entertainment", "projectId": null }}
      ],
      "payee": "Art Museum",
      "notes": "Entry ticket to exhibition",
      "date": "2023-09-22",
      "projectId": null,
      "accountId": "Main Bank Account",
      "categoryId": "Entertainment"
    }},
    {{
      "amount": -25,
      "detailsTransactions": [
        {{ "name": "Mooncakes", "quantity": 3, "unitPrice": 8.33, "amount": -25, "categoryId": "Food & Groceries", "projectId": "Mid-Autumn Festival Celebration" }}
      ],
      "payee": "Traditional Bakery",
      "notes": "Mid-Autumn Festival preparation",
      "date": "2023-09-24",
      "projectId": "Mid-Autumn Festival Celebration",
      "accountId": "Main Bank Account",
      "categoryId": "Food & Groceries"
    }},
    {{
      "amount": 3000,
      "detailsTransactions": [],
      "payee": "The Shanghai Times",
      "notes": "Monthly salary",
      "date": "2023-09-15",
      "projectId": null,
      "accountId": "Main Bank Account",
      "categoryId": "Savings"
    }}
  ]
}}

{{
  "categories": [
    {{"name": "Rent", "goal": 800}},
    {{"name": "Utilities", "goal": 100}},
    {{"name": "Food & Groceries", "goal": 300}},
    {{"name": "Dining Out", "goal": 150}},
    {{"name": "Transportation", "goal": 100}},
    {{"name": "Entertainment", "goal": 100}},
    {{"name": "Health & Wellness", "goal": 50}},
    {{"name": "Savings", "goal": 200}},
    {{"name": "Professional Development", "goal": 150}},
    {{"name": "Miscellaneous", "goal": 50}}
  ],
  "accounts": [
    {{"name": "Main Bank Account"}}
  ],
  "projects": [
    {{
      "name": "Mid-Autumn Festival Celebration",
      "budget": 100,
      "startDate": "2023-09-21",
      "endDate": "2023-09-29",
      "description": "Expenses related to Mid-Autumn Festival traditions."
    }}
  ],
  "transactions": [
    {{
      "amount": -800,
      "detailsTransactions": [
        {{
          "name": "Monthly Rent",
          "quantity": 1,
          "unitPrice": 800,
          "amount": 800,
          "categoryId": "Rent",
          "projectId": null
        }}
      ],
      "payee": "Sunrise Apartments",
      "notes": "Monthly apartment rent",
      "date": "2023-09-01",
      "projectId": null,
      "accountId": "Main Bank Account",
      "categoryId": "Rent"
    }},
    {{
      "amount": -30,
      "detailsTransactions": [
        {{
          "name": "Vegetables",
          "quantity": 5,
          "unitPrice": 4,
          "amount": 20,
          "categoryId": "Food & Groceries",
          "projectId": null
        }},
        {{
          "name": "Fruits",
          "quantity": 2,
          "unitPrice": 5,
          "amount": 10,
          "categoryId": "Food & Groceries",
          "projectId": null
        }}
      ],
      "payee": "Green Mart",
      "notes": "Purchase of organic vegetables and fruits",
      "date": "2023-09-25",
      "projectId": null,
      "accountId": "Main Bank Account",
      "categoryId": "Food & Groceries"
    }},
    {{
      "amount": -15,
      "detailsTransactions": [
        {{
          "name": "Pastries",
          "quantity": 3,
          "unitPrice": 3,
          "amount": 9,
          "categoryId": "Food & Groceries",
          "projectId": null
        }},
        {{
          "name": "Bread",
          "quantity": 1,
          "unitPrice": 6,
          "amount": 6,
          "categoryId": "Food & Groceries",
          "projectId": null
        }}
      ],
      "payee": "Bakery Delight",
      "notes": "Weekly purchase of bread and pastries",
      "date": "2023-09-26",
      "projectId": null,
      "accountId": "Main Bank Account",
      "categoryId": "Food & Groceries"
    }},
    {{
      "amount": -25,
      "detailsTransactions": [
        {{
          "name": "Metro Pass",
          "quantity": 1,
          "unitPrice": 15,
          "amount": 15,
          "categoryId": "Transportation",
          "projectId": null
        }},
        {{
          "name": "Bus Tokens",
          "quantity": 2,
          "unitPrice": 5,
          "amount": 10,
          "categoryId": "Transportation",
          "projectId": null
        }}
      ],
      "payee": "Public Transport Service",
      "notes": "Weekly metro and bus pass",
      "date": "2023-09-26",
      "projectId": null,
      "accountId": "Main Bank Account",
      "categoryId": "Transportation"
    }},
    {{
      "amount": -12,
      "detailsTransactions": [
        {{
          "name": "Yoga Class",
          "quantity": 1,
          "unitPrice": 12,
          "amount": 12,
          "categoryId": "Health & Wellness",
          "projectId": null
        }}
      ],
      "payee": "Fit Club",
      "notes": "Weekly yoga class fees",
      "date": "2023-09-27",
      "projectId": null,
      "accountId": "Main Bank Account",
      "categoryId": "Health & Wellness"
    }},
    {{
      "amount": -20,
      "detailsTransactions": [
        {{
          "name": "Dinner",
          "quantity": 1,
          "unitPrice": 20,
          "amount": 20,
          "categoryId": "Dining Out",
          "projectId": null
        }}
      ],
      "payee": "Dining Pavillion",
      "notes": "Casual dinner with friends",
      "date": "2023-09-28",
      "projectId": null,
      "accountId": "Main Bank Account",
      "categoryId": "Dining Out"
    }},
    {{
      "amount": -40,
      "detailsTransactions": [
        {{
          "name": "Movie Tickets",
          "quantity": 2,
          "unitPrice": 20,
          "amount": 40,
          "categoryId": "Entertainment",
          "projectId": null
        }}
      ],
      "payee": "Cinema Plus",
      "notes": "Two movie tickets for the independent film festival",
      "date": "2023-09-28",
      "projectId": null,
      "accountId": "Main Bank Account",
      "categoryId": "Entertainment"
    }},
    {{
      "amount": -5,
      "detailsTransactions": [
        {{
          "name": "Journal",
          "quantity": 1,
          "unitPrice": 3,
          "amount": 3,
          "categoryId": "Miscellaneous",
          "projectId": null
        }},
        {{
          "name": "Pens",
          "quantity": 2,
          "unitPrice": 1,
          "amount": 2,
          "categoryId": "Miscellaneous",
          "projectId": null
        }}
      ],
      "payee": "Stationary World",
      "notes": "Purchase of journal and pens",
      "date": "2023-09-29",
      "projectId": null,
      "accountId": "Main Bank Account",
      "categoryId": "Miscellaneous"
    }},
    {{
      "amount": -15,
      "detailsTransactions": [
        {{
          "name": "Coffee",
          "quantity": 1,
          "unitPrice": 10,
          "amount": 10,
          "categoryId": "Dining Out",
          "projectId": null
        }},
        {{
          "name": "Muffin",
          "quantity": 1,
          "unitPrice": 5,
          "amount": 5,
          "categoryId": "Dining Out",
          "projectId": null
        }}
      ],
      "payee": "Starbucks",
      "notes": "Coffee and muffin on a work break",
      "date": "2023-09-30",
      "projectId": null,
      "accountId": "Main Bank Account",
      "categoryId": "Dining Out"
    }}
  ]
}}



` 

  const currentDate = new Date();
  const threeMonthsBefore = subMonths(currentDate, 3);
  const startOfThreeMonthsBefore = startOfMonth(currentDate);


  const dataGenPrompt = await  ChatPromptTemplate.fromMessages([
    ["system",genPrompt],
    new MessagesPlaceholder(MEMORY_KEY),
    ["human","{input}"],
  ]).partial({
    format_instructions: formatInstExtender,
  })

  const formatDetails = `Respond only in valid JSON. The JSON object you return should match the following schema:

  categories:contains an array which contains ALL the categories used so far in both transactions and detailsTransactions **WITHOUT EXCEPTION**
  accounts: represents ALL the accounts of the persona **WITHOUT EXCEPTION**
  projects: represents ALL the projects used so far in both transactions and detailsTransactions **WITHOUT EXCEPTION**
  
   FinancialDataSchema = z.object({
 categories: z.array(
 z.object({
 name: z.string(),
 goal: z.number().nullable().optional(), //represent the monthly limit expense oder the montly target to reach
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
 startDate: z.string(),  message: "Invalid date format",
 }),
 endDate: z.string(),  message: "Invalid date format",
 }),
 description: z.string().nullable().optional(),
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
 projectId: z.string().nullable().optional(), // Make optional
 accountId: z.string(),
 categoryId: z.string().nullable() ),

})
  `

/*   const agent = await createToolCallingAgent({llm:model,tools,prompt:dataGenPrompt})
  const agentExecutor = new AgentExecutor({
    agent,
    tools
  })

  const agentRunnable = new RunnableLambda({
    func: async ({chat_history,input}:{
      input:string,
      chat_history:BaseMessage[]
    })=>{
      const res = await agentExecutor.invoke({chat_history,input});
      return res.output;
    }
  }) */
const refinePrompt=` 
You are an advanced AI specialized in enhancing financial transaction data by ensuring cultural alignment, personalization, and creativity. Your primary objective is to ensure that the names of banks, payees, and items are creative and contextually appropriate, and that the transactions reflect the persona's cultural background, lifestyle, and preferences.

YOU WILL ONLY WORK IN US DOLLAR. if the currency is not in US DOLLAR CONVERT IT



Your Tasks:

Analyze the Persona Description:

Thoroughly review the provided persona description to understand cultural background, lifestyle choices, hobbies, and personal preferences.
Identify elements that influence spending habits, such as traditional practices, dietary preferences, leisure activities, and environmental consciousness.
Generate Creative and Culturally Appropriate Names:

Accounts:
Invent plausible and culturally appropriate names for existing bank accounts.
Ensure names reflect the persona's Danish-Canadian heritage and her residence in Oakwood Hills, Toronto.
Payees:
Create unique and contextually relevant names for all payees in the transactions.
Align payee names with the persona's sustainable living practices and community involvement.
Items in detailsTransactions:
Expand grouped transaction categories into individual items with realistic and specific product or service names.
Avoid generic terms by listing each item separately, enhancing the clarity of spending habits.
Enhance Transaction Details:

Extend detailsTransactions:
 systematically expand all detailsTransactions in financial data. Your goal is to ensure that every grouped item or abstract entry is decomposed into individual, specific, and realistic items, while retaining consistency with the persona's lifestyle, preferences, and goals. Here's how you should approach this task:

Expand grouped items into specific, individual entries. For example:
Replace "Organic Essentials Basket" with a list of individual products such as "Organic Kale," "Free-Range Eggs," etc.
Ensure each item in the decomposition includes:
A realistic product name.
Quantity (e.g., the number of units purchased).
Unit Price (e.g., the cost per item or per unit).
Total Amount (calculated as quantity * unit price).
The appropriate categoryId and projectId.
Reflect Realism and Persona Alignment:



Cultural Fit: Use culturally appropriate items and names that match the persona's background (e.g., eco-conscious, organic products for Zara).
Lifestyle Fit: Align with the persona's lifestyle, such as dietary preferences, hobbies, and family needs.
Formatting Guidelines:

Currency Multiplication: Multiply all price-related values by 1,000 to reflect realistic financial amounts.
Ensure Accuracy: Verify that the sum of individual item amounts equals the parent transaction's total amount.
Avoid Generic Labels: Use specific names instead of generic terms like "Groceries" or "Utilities."

Multiply all price-related values by 1,000 to reflect realistic amounts (e.g., $100 becomes $100,000).
Maintain Realism:
Ensure that the detailed items and their prices are plausible and reflect the persona's spending capacity and lifestyle.
Ensure Comprehensive Listing of Categories, Projects, and Accounts:

Categories, Projects, and Accounts Listing:
Verify that all categories, projects, and accounts used in the transactions are listed at the top of the JSON output.
Ensure consistency and completeness, without adding new categories, projects, or accounts beyond those present in the existing transaction set.
Maintain Data Integrity:

Modify Existing Transactions Only:
Do not add any new transactions to the dataset.
Focus solely on modifying existing transactions to enhance names and item details as per the persona's profile.
Consistency and Alignment:
Ensure that all modifications align with the persona's financial goals, cultural background, and lifestyle.
Maintain consistency in naming conventions and categorization across all transactions.
Formatting and Clarity:

JSON Compliance:
Ensure that all modifications result in valid JSON output adhering strictly to the provided schema.

tag/n{format_instructions}

exemple Input: 
{{
  "categories": [
    {{"name": "Rent", "goal": 250}},
    {{"name": "Groceries", "goal": 600}},
    {{"name": "Dining Out", "goal": 200}},
    {{"name": "Transportation", "goal": 150}},
    {{"name": "Utilities", "goal": 150}},
    {{"name": "Education", "goal": 300}},
    {{"name": "Entertainment", "goal": 100}},
    {{"name": "Books", "goal": 50}},
    {{"name": "Savings", "goal": 420}},
    {{"name": "Charity", "goal": 75}},
    {{"name": "Healthcare", "goal": 150}}
  ],
  "accounts": [
    {{"name": "Primary Bank Account"}}
  ],
  "projects": [
    {{
      "name": "Vacation Home Purchase",
      "budget": 200000,
      "startDate": "2023-01-01",
      "endDate": "2023-12-31",
      "description": "Invest in a vacation home in the Turkish countryside."
    }}
  ],
  "transactions": [
    {{
      "amount": -130,
      "detailsTransactions": [
        {{"name": "Organic Vegetables & Fruits", "quantity": 15, "unitPrice": 3, "amount": -45, "categoryId": "Groceries", "projectId": null}},
        {{"name": "Halal Meat", "quantity": 6, "unitPrice": 10, "amount": -60, "categoryId": "Groceries", "projectId": null}},
        {{"name": "Dairy Products", "quantity": 5, "unitPrice": 5, "amount": -25, "categoryId": "Groceries", "projectId": null}}
      ],
      "payee": "Local Market",
      "notes": "Purchase of weekly groceries",
      "date": "2023-11-08",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Groceries"
    }},
    {{
      "amount": -1200,
      "detailsTransactions": [
        {{"name": "Monthly Rent Payment", "quantity": 1, "unitPrice": 1200, "amount": -1200, "categoryId": "Rent", "projectId": null}}
      ],
      "payee": "Landlord",
      "notes": "Monthly rent for apartment",
      "date": "2023-11-01",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Rent"
    }},
    {{
      "amount": -50,
      "detailsTransactions": [],
      "payee": "Public Transport Top-Up",
      "notes": "Monthly transportation pass",
      "date": "2023-11-09",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Transportation"
    }},
    {{
      "amount": -100,
      "detailsTransactions": [],
      "payee": "Electricity Provider",
      "notes": "Monthly electricity bill",
      "date": "2023-11-10",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Utilities"
    }},
    {{
      "amount": -60,
      "detailsTransactions": [
        {{"name": "The Economist Subscription", "quantity": 1, "unitPrice": 60, "amount": -60, "categoryId": "Education", "projectId": null}}
      ],
      "payee": "Magazine Store",
      "notes": "Annual subscription renewal",
      "date": "2023-11-11",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Education"
    }},
    {{
      "amount": -30,
      "detailsTransactions": [],
      "payee": "Coffee Shop",
      "notes": "Arabic coffee with colleagues",
      "date": "2023-11-12",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Dining Out"
    }},
    {{
      "amount": -90,
      "detailsTransactions": [
        {{"name": "Documentary Streaming Service", "quantity": 1, "unitPrice": 15, "amount": -15, "categoryId": "Entertainment", "projectId": null}},
        {{"name": "Weekend Family Movie Night", "quantity": 1, "unitPrice": 75, "amount": -75, "categoryId": "Entertainment", "projectId": null}}
      ],
      "payee": "Streaming Platforms",
      "notes": "Family entertainment",
      "date": "2023-11-13",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Entertainment"
    }},
    {{
      "amount": -40,
      "detailsTransactions": [],
      "payee": "Charity Donation",
      "notes": "Monthly contribution to local charity",
      "date": "2023-11-14",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Charity"
    }}
  ]
}} 
corresponding output: {{
  "categories": [
    {{ "name": "Rent", "goal": 250000 }},
    {{ "name": "Groceries", "goal": 600000 }},
    {{ "name": "Dining Out", "goal": 200000 }},
    {{ "name": "Transportation", "goal": 150000 }},
    {{ "name": "Utilities", "goal": 150000 }},
    {{ "name": "Education", "goal": 300000 }},
    {{ "name": "Entertainment", "goal": 100000 }},
    {{ "name": "Books", "goal": 50000 }},
    {{ "name": "Savings", "goal": 420000 }},
    {{ "name": "Charity", "goal": 75000 }},
    {{ "name": "Healthcare", "goal": 150000 }}
  ],
  "accounts": [
    {{ "name": "Turkiye Garanti Bankası (Garanti BBVA)" }}
  ],
  "projects": [
    {{
      "name": "Vacation Home Purchase",
      "budget": 200000000,
      "startDate": "2023-01-01",
      "endDate": "2023-12-31",
      "description": "Invest in a vacation home in the Turkish countryside."
    }}
  ],
  "transactions": [
    {{
      "amount": -130000,
      "detailsTransactions": [
        {{
          "name": "Organic Spinach (1kg)",
          "quantity": 5,
          "unitPrice": 6000,
          "amount": -30000,
          "categoryId": "Groceries",
          "projectId": null
        }},
        {{
          "name": "Fresh Tomatoes (2kg)",
          "quantity": 3,
          "unitPrice": 5000,
          "amount": -15000,
          "categoryId": "Groceries",
          "projectId": null
        }},
        {{
          "name": "Halal Chicken Breasts (1kg)",
          "quantity": 2,
          "unitPrice": 20000,
          "amount": -40000,
          "categoryId": "Groceries",
          "projectId": null
        }},
        {{
          "name": "Dairy Milk (2L)",
          "quantity": 4,
          "unitPrice": 2500,
          "amount": -10000,
          "categoryId": "Groceries",
          "projectId": null
        }},
        {{
          "name": "Yogurt (1kg)",
          "quantity": 3,
          "unitPrice": 5000,
          "amount": -15000,
          "categoryId": "Groceries",
          "projectId": null
        }}
      ],
      "payee": "İstanbul Organic Bazaar",
      "notes": "Purchase of weekly groceries",
      "date": "2023-11-08",
      "projectId": null,
      "accountId": "Turkiye Garanti Bankası (Garanti BBVA)",
      "categoryId": "Groceries"
    }},
    {{
      "amount": -1200000,
      "detailsTransactions": [
        {{
          "name": "Monthly Rent Payment",
          "quantity": 1,
          "unitPrice": 1200000,
          "amount": -1200000,
          "categoryId": "Rent",
          "projectId": null
        }}
      ],
      "payee": "Emirhan Property Management",
      "notes": "Monthly rent for apartment",
      "date": "2023-11-01",
      "projectId": null,
      "accountId": "Turkiye Garanti Bankası (Garanti BBVA)",
      "categoryId": "Rent"
    }},
    {{
      "amount": -50000,
      "detailsTransactions": [
        {{
          "name": "Monthly Transit Pass",
          "quantity": 1,
          "unitPrice": 50000,
          "amount": -50000,
          "categoryId": "Transportation",
          "projectId": null
        }}
      ],
      "payee": "İstanbul Ulaşım A.Ş.",
      "notes": "Monthly transportation pass",
      "date": "2023-11-09",
      "projectId": null,
      "accountId": "Turkiye Garanti Bankası (Garanti BBVA)",
      "categoryId": "Transportation"
    }},
    {{
      "amount": -100000,
      "detailsTransactions": [
        {{
          "name": "Electricity Bill",
          "quantity": 1,
          "unitPrice": 60000,
          "amount": -60000,
          "categoryId": "Utilities",
          "projectId": null
        }},
        {{
          "name": "Water Bill",
          "quantity": 1,
          "unitPrice": 40000,
          "amount": -40000,
          "categoryId": "Utilities",
          "projectId": null
        }}
      ],
      "payee": "İstanbul Elektrik Dağıtım",
      "notes": "Monthly utility bills",
      "date": "2023-11-10",
      "projectId": null,
      "accountId": "Turkiye Garanti Bankası (Garanti BBVA)",
      "categoryId": "Utilities"
    }},
    {{
      "amount": -60000,
      "detailsTransactions": [
        {{
          "name": "The Economist Subscription",
          "quantity": 1,
          "unitPrice": 60000,
          "amount": -60000,
          "categoryId": "Education",
          "projectId": null
        }}
      ],
      "payee": "The Economist Official Store",
      "notes": "Annual subscription renewal",
      "date": "2023-11-11",
      "projectId": null,
      "accountId": "Turkiye Garanti Bankası (Garanti BBVA)",
      "categoryId": "Education"
    }},
    {{
      "amount": -30000,
      "detailsTransactions": [
        {{
          "name": "Arabic Coffee",
          "quantity": 1,
          "unitPrice": 20000,
          "amount": -20000,
          "categoryId": "Dining Out",
          "projectId": null
        }},
        {{
          "name": "Assorted Pastries",
          "quantity": 1,
          "unitPrice": 10000,
          "amount": -10000,
          "categoryId": "Dining Out",
          "projectId": null
        }}
      ],
      "payee": "Al-Qahwa Arabic Coffee House",
      "notes": "Arabic coffee with colleagues",
      "date": "2023-11-12",
      "projectId": null,
      "accountId": "Turkiye Garanti Bankası (Garanti BBVA)",
      "categoryId": "Dining Out"
    }},
    {{
      "amount": -90000,
      "detailsTransactions": [
        {{
          "name": "HistoryStream Premium Subscription",
          "quantity": 1,
          "unitPrice": 15000,
          "amount": -15000,
          "categoryId": "Entertainment",
          "projectId": null
        }},
        {{
          "name": "Ottoman Empire Documentary Night Package",
          "quantity": 1,
          "unitPrice": 75000,
          "amount": -75000,
          "categoryId": "Entertainment",
          "projectId": null
        }}
      ],
      "payee": "Netflix Istanbul",
      "notes": "Family entertainment",
      "date": "2023-11-13",
      "projectId": null,
      "accountId": "Turkiye Garanti Bankası (Garanti BBVA)",
      "categoryId": "Entertainment"
    }},
    {{
      "amount": -40000,
      "detailsTransactions": [
        {{
          "name": "Donation to Orphanage",
          "quantity": 1,
          "unitPrice": 40000,
          "amount": -40000,
          "categoryId": "Charity",
          "projectId": null
        }}
      ],
      "payee": "Istanbul Children's Charity",
      "notes": "Monthly contribution to local charity",
      "date": "2023-11-14",
      "projectId": null,
      "accountId": "Turkiye Garanti Bankası (Garanti BBVA)",
      "categoryId": "Charity"
    }}
  ]
}}


exemple Input:{{
  "categories": [
    {{ "name": "Rent", "goal": 250 }},
    {{ "name": "Groceries", "goal": 600 }},
    {{ "name": "Dining Out", "goal": 200 }},
    {{ "name": "Transportation", "goal": 150 }},
    {{ "name": "Utilities", "goal": 150 }},
    {{ "name": "Education", "goal": 300 }},
    {{ "name": "Entertainment", "goal": 100 }},
    {{ "name": "Books", "goal": 50 }},
    {{ "name": "Savings", "goal": 420 }},
    {{ "name": "Charity", "goal": 75 }},
    {{ "name": "Healthcare", "goal": 150 }}
  ],
  "accounts": [
    {{ "name": "Primary Bank Account" }}
  ],
  "projects": [
    {{
      "name": "Vacation Home Purchase",
      "budget": 200000,
      "startDate": "2023-01-01",
      "endDate": "2023-12-31",
      "description": "Invest in a vacation home in the Turkish countryside."
    }}
  ],
  "transactions": [
    {{
      "amount": -150,
      "detailsTransactions": [
        {{ "name": "Organic Produce", "quantity": 20, "unitPrice": 3, "amount": -60, "categoryId": "Groceries", "projectId": null }},
        {{ "name": "Fish & Poultry", "quantity": 5, "unitPrice": 10, "amount": -50, "categoryId": "Groceries", "projectId": null }},
        {{ "name": "Baked Goods", "quantity": 4, "unitPrice": 10, "amount": -40, "categoryId": "Groceries", "projectId": null }}
      ],
      "payee": "Organic Grocery Store",
      "notes": "Weekly groceries",
      "date": "2023-11-15",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Groceries"
    }},
    {{
      "amount": -40,
      "detailsTransactions": [],
      "payee": "Taxi Service",
      "notes": "Trip to Istanbul University",
      "date": "2023-11-16",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Transportation"
    }},
    {{
      "amount": -50,
      "detailsTransactions": [],
      "payee": "Water Utility",
      "notes": "Monthly water bill",
      "date": "2023-11-17",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Utilities"
    }},
    {{
      "amount": -100,
      "detailsTransactions": [],
      "payee": "Private Tutor",
      "notes": "French lessons for children",
      "date": "2023-11-18",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Education"
    }},
    {{
      "amount": -75,
      "detailsTransactions": [],
      "payee": "Local Turkish Restaurant",
      "notes": "Dinner with family friends",
      "date": "2023-11-19",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Dining Out"
    }},
    {{
      "amount": -35,
      "detailsTransactions": [
        {{ "name": "Family Board Game Night", "quantity": 1, "unitPrice": 35, "amount": -35, "categoryId": "Entertainment", "projectId": null }}
      ],
      "payee": "Toy Store",
      "notes": "Purchase of new board games",
      "date": "2023-11-20",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Entertainment"
    }},
    {{
      "amount": -45,
      "detailsTransactions": [],
      "payee": "Medical Checkup",
      "notes": "Routine health check-up",
      "date": "2023-11-21",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Healthcare"
    }},
    {{
      "amount": -250,
      "detailsTransactions": [
        {{ "name": "Monthly Apartment Rent", "quantity": 1, "unitPrice": 250, "amount": -250, "categoryId": "Rent", "projectId": null }}
      ],
      "payee": "Landlord",
      "notes": "Rent payment for November",
      "date": "2023-11-01",
      "projectId": null,
      "accountId": "Primary Bank Account",
      "categoryId": "Rent"
    }}
  ]
}}

corresponding output :

exemple input: {{ 
  "categories": [ 
    {{ "name": "Food & Groceries", "goal": 500 }},
    {{ "name": "Loan Payments & Credit Cards", "goal": 400 }},
    {{ "name": "Utilities", "goal": 150 }},
    {{ "name": "Transportation", "goal": 100 }},
    {{ "name": "Entertainment & Education", "goal": 150 }},
    {{ "name": "Savings & Investments", "goal": 300 }}
  ], 
  "accounts": [ 
    {{ "name": "Primary Bank Account" }}
  ], 
  "projects": [ 
    {{ 
      "name": "Community Garden Project", 
      "budget": 200, 
      "startDate": "2023-09-01", 
      "endDate": "2023-12-31", 
      "description": "Developing a sustainable community garden." 
    }},
    {{ 
      "name": "Photography Course", 
      "budget": 250, 
      "startDate": "2023-11-01", 
      "endDate": "2023-11-30", 
      "description": "Enrolling in a course to enhance environmental documentation skills." 
    }}
  ], 
  "transactions": [ 
    {{ 
      "amount": 1250, 
      "detailsTransactions": [], 
      "payee": "Emerge Sustainability", 
      "notes": "Bi-weekly salary", 
      "date": "2023-11-01", 
      "projectId": null, 
      "accountId": "Primary Bank Account", 
      "categoryId": null 
    }},
    {{ 
      "amount": -150, 
      "detailsTransactions": [ 
        {{ 
          "name": "Electricity Bill", 
          "quantity": 1, 
          "unitPrice": 75, 
          "amount": -75, 
          "categoryId": "Utilities", 
          "projectId": null 
        }},
        {{ 
          "name": "Water Bill", 
          "quantity": 1, 
          "unitPrice": 50, 
          "amount": -50, 
          "categoryId": "Utilities", 
          "projectId": null 
        }}
      ], 
      "payee": "Oakwood Utilities", 
      "notes": "Monthly utility bills", 
      "date": "2023-11-03", 
      "projectId": null, 
      "accountId": "Primary Bank Account", 
      "categoryId": "Utilities" 
    }},
    {{ 
      "amount": -90, 
      "detailsTransactions": [ 
        {{ 
          "name": "Public Transport", 
          "quantity": 10, 
          "unitPrice": 9, 
          "amount": -90, 
          "categoryId": "Transportation", 
          "projectId": null 
        }}
      ], 
      "payee": "Toronto Transit Commission", 
      "notes": "Weekly public transit expenses", 
      "date": "2023-11-04", 
      "projectId": null, 
      "accountId": "Primary Bank Account", 
      "categoryId": "Transportation" 
    }},
    {{ 
      "amount": -100, 
      "detailsTransactions": [ 
        {{ 
          "name": "Community Garden Supplies", 
          "quantity": 1, 
          "unitPrice": 100, 
          "amount": -100, 
          "categoryId": null, 
          "projectId": "Community Garden Project" 
        }}
      ], 
      "payee": "Green Growers", 
      "notes": "Supplies for community garden project.", 
      "date": "2023-11-05", 
      "projectId": "Community Garden Project", 
      "accountId": "Primary Bank Account", 
      "categoryId": null 
    }},
    {{ 
      "amount": -60, 
      "detailsTransactions": [ 
        {{ 
          "name": "Theme Park Tickets", 
          "quantity": 4, 
          "unitPrice": 15, 
          "amount": -60, 
          "categoryId": "Entertainment & Education", 
          "projectId": null 
        }}
      ], 
      "payee": "Adventureland", 
      "notes": "Family day out", 
      "date": "2023-11-06", 
      "projectId": null, 
      "accountId": "Primary Bank Account", 
      "categoryId": "Entertainment & Education" 
    }},
    {{ 
      "amount": -120, 
      "detailsTransactions": [ 
        {{ 
          "name": "Groceries", 
          "quantity": null, 
          "unitPrice": null, 
          "amount": -120, 
          "categoryId": "Food & Groceries", 
          "projectId": null 
        }}
      ], 
      "payee": "Organic Grocery Store", 
      "notes": "Weekly grocery shopping", 
      "date": "2023-11-07", 
      "projectId": null, 
      "accountId": "Primary Bank Account", 
      "categoryId": "Food & Groceries" 
    }},
    {{ 
      "amount": -250, 
      "detailsTransactions": [ 
        {{ 
          "name": "Student Loan Payment", 
          "quantity": 1, 
          "unitPrice": 250, 
          "amount": -250, 
          "categoryId": "Loan Payments & Credit Cards", 
          "projectId": null 
        }}
      ], 
      "payee": "Student Loan Center", 
      "notes": "Monthly student loan payment", 
      "date": "2023-11-02", 
      "projectId": null, 
      "accountId": "Primary Bank Account", 
      "categoryId": "Loan Payments & Credit Cards" 
    }},
    {{ 
      "amount": -180, 
      "detailsTransactions": [], 
      "payee": "RoboInvest", 
      "notes": "Monthly savings and investment contribution", 
      "date": "2023-11-07", 
      "projectId": null, 
      "accountId": "Primary Bank Account", 
      "categoryId": "Savings & Investments" 
    }}
  ] 
}}



   exemple output:{{ 
  "categories": [ 
    {{ "name": "Food & Groceries", "goal": 500000 }},
    {{ "name": "Loan Payments & Credit Cards", "goal": 400000 }},
    {{ "name": "Utilities", "goal": 150000 }},
    {{ "name": "Transportation", "goal": 100000 }},
    {{ "name": "Entertainment & Education", "goal": 150000 }},
    {{ "name": "Savings & Investments", "goal": 300000 }}
  ], 
  "accounts": [ 
    {{ "name": "Royal Bank of Canada (RBC)" }},
    {{ "name": "Toronto Dominion Bank (TD)" }},
    {{ "name": "Scotiabank" }}
  ], 
  "projects": [ 
    {{ 
      "name": "Community Garden Project", 
      "budget": 200000, 
      "startDate": "2023-09-01", 
      "endDate": "2023-12-31", 
      "description": "Developing a sustainable community garden." 
    }},
    {{ 
      "name": "Photography Course", 
      "budget": 250000, 
      "startDate": "2023-11-01", 
      "endDate": "2023-11-30", 
      "description": "Enrolling in a course to enhance environmental documentation skills." 
    }}
  ], 
  "transactions": [ 
    {{ 
      "amount": 1250000, 
      "detailsTransactions": [], 
      "payee": "Emerge Sustainability", 
      "notes": "Bi-weekly salary", 
      "date": "2023-11-01", 
      "projectId": null, 
      "accountId": "Royal Bank of Canada (RBC)", 
      "categoryId": null 
    }},
    {{ 
      "amount": -150000, 
      "detailsTransactions": [ 
        {{ 
          "name": "Hydro-One Power Supply", 
          "quantity": 1, 
          "unitPrice": 75000, 
          "amount": -75000, 
          "categoryId": "Utilities", 
          "projectId": null 
        }},
        {{ 
          "name": "PureLife Water Services", 
          "quantity": 1, 
          "unitPrice": 50000, 
          "amount": -50000, 
          "categoryId": "Utilities", 
          "projectId": null 
        }}
      ], 
      "payee": "Oakwood Utilities", 
      "notes": "Monthly utility bills", 
      "date": "2023-11-03", 
      "projectId": null, 
      "accountId": "Toronto Dominion Bank (TD)", 
      "categoryId": "Utilities" 
    }},
    {{ 
      "amount": -90000, 
      "detailsTransactions": [ 
        {{ 
          "name": "CommuteEco Transit Pass", 
          "quantity": 30, 
          "unitPrice": 3000, 
          "amount": -90000, 
          "categoryId": "Transportation", 
          "projectId": null 
        }}
      ], 
      "payee": "Toronto Transit Commission", 
      "notes": "Weekly public transit expenses", 
      "date": "2023-11-04", 
      "projectId": null, 
      "accountId": "Scotiabank", 
      "categoryId": "Transportation" 
    }},
    {{ 
      "amount": -100000, 
      "detailsTransactions": [ 
        {{ 
          "name": "Eco-Garden Soil & Seeds", 
          "quantity": 1, 
          "unitPrice": 100000, 
          "amount": -100000, 
          "categoryId": null, 
          "projectId": "Community Garden Project" 
        }}
      ], 
      "payee": "Green Growers", 
      "notes": "Supplies for community garden project.", 
      "date": "2023-11-05", 
      "projectId": "Community Garden Project", 
      "accountId": "Royal Bank of Canada (RBC)", 
      "categoryId": null 
    }},
    {{ 
      "amount": -60000, 
      "detailsTransactions": [ 
        {{ 
          "name": "EcoFun Family Park Pass", 
          "quantity": 4, 
          "unitPrice": 15000, 
          "amount": -60000, 
          "categoryId": "Entertainment & Education", 
          "projectId": null 
        }}
      ], 
      "payee": "Adventureland", 
      "notes": "Family day out", 
      "date": "2023-11-06", 
      "projectId": null, 
      "accountId": "Scotiabank", 
      "categoryId": "Entertainment & Education" 
    }},
    {{ 
      "amount": -120000, 
      "detailsTransactions": [ 
        {{ 
          "name": "Organic Kale", 
          "quantity": 1, 
          "unitPrice": 10000, 
          "amount": -10000, 
          "categoryId": "Food & Groceries", 
          "projectId": null 
        }},
        {{ 
          "name": "Fair-Trade Coffee Beans", 
          "quantity": 1, 
          "unitPrice": 15000, 
          "amount": -15000, 
          "categoryId": "Food & Groceries", 
          "projectId": null 
        }},
        {{ 
          "name": "Free-Range Eggs (Dozen)", 
          "quantity": 1, 
          "unitPrice": 12000, 
          "amount": -12000, 
          "categoryId": "Food & Groceries", 
          "projectId": null 
        }},
        {{ 
          "name": "Local Honey Jar (500ml)", 
          "quantity": 1, 
          "unitPrice": 8000, 
          "amount": -8000, 
          "categoryId": "Food & Groceries", 
          "projectId": null 
        }},
        {{ 
          "name": "Fresh Strawberries (500g)", 
          "quantity": 1, 
          "unitPrice": 12000, 
          "amount": -12000, 
          "categoryId": "Food & Groceries", 
          "projectId": null 
        }},
        {{ 
          "name": "Sweet Potatoes (1kg)", 
          "quantity": 1, 
          "unitPrice": 9000, 
          "amount": -9000, 
          "categoryId": "Food & Groceries", 
          "projectId": null 
        }},
        {{ 
          "name": "Artisan Sourdough Bread", 
          "quantity": 1, 
          "unitPrice": 10000, 
          "amount": -10000, 
          "categoryId": "Food & Groceries", 
          "projectId": null 
        }},
        {{ 
          "name": "Organic Butter (250g)", 
          "quantity": 1, 
          "unitPrice": 7000, 
          "amount": -7000, 
          "categoryId": "Food & Groceries", 
          "projectId": null 
        }},
        {{ 
          "name": "Cheddar Cheese Block (500g)", 
          "quantity": 1, 
          "unitPrice": 14000, 
          "amount": -14000, 
          "categoryId": "Food & Groceries", 
          "projectId": null 
        }},
        {{ 
          "name": "Fresh Spinach Leaves (500g)", 
          "quantity": 1, 
          "unitPrice": 6000, 
          "amount": -6000, 
          "categoryId": "Food & Groceries", 
          "projectId": null 
        }}
      ], 
      "payee": "The Maple Green Grocer", 
      "notes": "Weekly grocery shopping", 
      "date": "2023-11-07", 
      "projectId": null, 
      "accountId": "Royal Bank of Canada (RBC)", 
      "categoryId": "Food & Groceries" 
    }},
    {{ 
      "amount": -250000, 
      "detailsTransactions": [ 
        {{ 
          "name": "Higher Ed Loan Installment", 
          "quantity": 1, 
          "unitPrice": 250000, 
          "amount": -250000, 
          "categoryId": "Loan Payments & Credit Cards", 
          "projectId": null 
        }}
      ], 
      "payee": "Future Invest Loan Center", 
      "notes": "Monthly student loan payment", 
      "date": "2023-11-02", 
      "projectId": null, 
      "accountId": "Toronto Dominion Bank (TD)", 
      "categoryId": "Loan Payments & Credit Cards" 
    }},
    {{ 
      "amount": -180000, 
      "detailsTransactions": [], 
      "payee": "GreenPortfolio Investments", 
      "notes": "Monthly savings and investment contribution", 
      "date": "2023-11-07", 
      "projectId": null, 
      "accountId": "Royal Bank of Canada (RBC)", 
      "categoryId": "Savings & Investments" 
    }}
  ] 
}}



  here is some exemples of decomposition of detailsTransactions just to increase your undersanding : 

  1. Groceries
Input:

{{
  "name": "Weekly Grocery Shopping",
  "quantity": 1,
  "unitPrice": 120000,
  "amount": -120000,
  "categoryId": "Food & Groceries",
  "projectId": null
}}
Expanded Output:

{{
  "name": "Organic Kale",
  "quantity": 1,
  "unitPrice": 10000,
  "amount": -10000,
  "categoryId": "Food & Groceries",
  "projectId": null
}},
{{
  "name": "Fair-Trade Coffee Beans",
  "quantity": 1,
  "unitPrice": 15000,
  "amount": -15000,
  "categoryId": "Food & Groceries",
  "projectId": null
}},
...
2. Dining Out
Input:

{{
  "name": "Dinner at Family Restaurant",
  "quantity": 1,
  "unitPrice": 60000,
  "amount": -60000,
  "categoryId": "Dining Out",
  "projectId": null
}}
Expanded Output:

{{
  "name": "Grilled Salmon",
  "quantity": 1,
  "unitPrice": 25000,
  "amount": -25000,
  "categoryId": "Dining Out",
  "projectId": null
}},
{{
  "name": "Vegetable Stir-Fry",
  "quantity": 1,
  "unitPrice": 15000,
  "amount": -15000,
  "categoryId": "Dining Out",
  "projectId": null
}},
...
3. Utilities
Input:

{{
  "name": "Monthly Utility Bills",
  "quantity": 1,
  "unitPrice": 150000,
  "amount": -150000,
  "categoryId": "Utilities",
  "projectId": null
}}
Expanded Output:

{{
  "name": "Electricity Bill",
  "quantity": 1,
  "unitPrice": 75000,
  "amount": -75000,
  "categoryId": "Utilities",
  "projectId": null
}},
{{
  "name": "Water Bill",
  "quantity": 1,
  "unitPrice": 50000,
  "amount": -50000,
  "categoryId": "Utilities",
  "projectId": null
}},
...
4. Entertainment & Education
Input:

{{
  "name": "Family Day Out",
  "quantity": 1,
  "unitPrice": 60000,
  "amount": -60000,
  "categoryId": "Entertainment & Education",
  "projectId": null
}}
Expanded Output:

{{
  "name": "Amusement Park Tickets",
  "quantity": 2,
  "unitPrice": 15000,
  "amount": -30000,
  "categoryId": "Entertainment & Education",
  "projectId": null
}},
{{
  "name": "Cotton Candy",
  "quantity": 1,
  "unitPrice": 5000,
  "amount": -5000,
  "categoryId": "Entertainment & Education",
  "projectId": null
}},
...
5. Transportation
Input:

{{
  "name": "Weekly Public Transit",
  "quantity": 1,
  "unitPrice": 90000,
  "amount": -90000,
  "categoryId": "Transportation",
  "projectId": null
}}
Expanded Output:

{{
  "name": "Transit Pass (7-Day)",
  "quantity": 1,
  "unitPrice": 60000,
  "amount": -60000,
  "categoryId": "Transportation",
  "projectId": null
}},
{{
  "name": "Single Ride Tickets",
  "quantity": 10,
  "unitPrice": 3000,
  "amount": -30000,
  "categoryId": "Transportation",
  "projectId": null
}}
6. Savings & Investments
Input:

{{
  "name": "Monthly Investment Contribution",
  "quantity": 1,
  "unitPrice": 180000,
  "amount": -180000,
  "categoryId": "Savings & Investments",
  "projectId": null
}}
Expanded Output:

{{
  "name": "Robo-Advisory Service Fee",
  "quantity": 1,
  "unitPrice": 30000,
  "amount": -30000,
  "categoryId": "Savings & Investments",
  "projectId": null
}},
{{
  "name": "Stock Market Investments",
  "quantity": 1,
  "unitPrice": 100000,
  "amount": -100000,
  "categoryId": "Savings & Investments",
  "projectId": null
}},
...
7. Loan Payments & Credit Cards
Input:

{{
  "name": "Monthly Credit Card Payment",
  "quantity": 1,
  "unitPrice": 400000,
  "amount": -400000,
  "categoryId": "Loan Payments & Credit Cards",
  "projectId": null
}}
Expanded Output:

{{
  "name": "Principal Payment",
  "quantity": 1,
  "unitPrice": 300000,
  "amount": -300000,
  "categoryId": "Loan Payments & Credit Cards",
  "projectId": null
}},
{{
  "name": "Interest Payment",
  "quantity": 1,
  "unitPrice": 100000,
  "amount": -100000,
  "categoryId": "Loan Payments & Credit Cards",
  "projectId": null
}}


    `

    const refineChainPrompt = await  ChatPromptTemplate.fromMessages([
      ["system",refinePrompt],
      new MessagesPlaceholder("refined_history"),
      ["human","{input}"],
    ]).partial({
      format_instructions: formatDetails,
    })


    const refineChain = RunnableSequence.from([
      refineChainPrompt,
      model2,
      parserDataschema
    ])

  const dataGenChain = RunnableSequence.from([
    dataGenPrompt,
    model,
    parserDataschema
])

const IniInput = `
  IMPORTANT: Start generating the Transaction data. no need of Sample Data. Begin with the first week. your output must not have any surarounding text. 

  genrate the weekly data starting from this date: ${startOfThreeMonthsBefore}
  Persona: ${guideLine}
`
let transactions = []

for (let week = 0; week < 1; week++){
  console.log(week)
  let succes:boolean = false 

  let attempts = 0;
  console.log(attempts)
  const maxAttempts = 5;
  while (!succes && attempts < maxAttempts){
    attempts++;
    
  try{
  
  const weekData = await dataGenChain.invoke({
      input:week === 0 ? IniInput : attempts > 1 ? `your failed generating the last set of financial data. this is your ${attempts+1}.retry again. carefully follow all the JSON format instruction. directly response with the JSON object without any surrounding text. ` : `generate the next week using the same persona`,
      chat_history:History
    })

    const detailedWeekData = await refineChain.invoke({
      input:week === 0 ?attempts > 1 ? `your failed generating the last set of financial data. this is your ${attempts+1}.retry again. carefully follow all the JSON format instruction. directly response with the JSON object without any surrounding text. ` : `${JSON.stringify(weekData)} persona:${guideLine}` : `modify the next week same persona ${JSON.stringify(weekData)}`,
      refined_history:refinedHistory
    })

        console.log(weekData)
        console.log(detailedWeekData)

    History.push(new HumanMessage("generate the next week  using the same persona . carefuly follow all the instruction i provided you"))
    History.push(new AIMessage(JSON.stringify(weekData)))

    refinedHistory.push(new HumanMessage("generate the next week  using the same persona . carefuly follow all the instruction i provided you"))
    refinedHistory.push(new AIMessage(JSON.stringify(detailedWeekData)))
    transactions.push(detailedWeekData)

    succes=true
    
  }catch(err){
    console.log(err)
    if (attempts === maxAttempts) {
      
      return 'Something went wrong. Please try again.';
  }
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

let succes:boolean = false 

let attempts = 0;
console.log(attempts)
const maxAttempts = 5;

 
   
      attempts++;
      const response =  await followUpChain.invoke({
        input:`transactions: ${transactions} ${personaDes}`,
        chat_history:History
      })
      succes=false

      console.log(response)
    

  
  console.log(response)
  return response 
}
