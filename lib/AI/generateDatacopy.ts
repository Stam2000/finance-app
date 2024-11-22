import { RunnableSequence,RunnableLike,Runnable} from "@langchain/core/runnables"
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

/* type ResTypeProject = InferResponseType<typeof client.api.projects.$post> */
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

const ProjectSchema = z.object({
  name: z.string(),
  budget: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string().optional(),
});

const ProjectSchemaOutput = z.object({
  name: z.string(),
  id: z.string(),
  userId: z.string(),
  description: z.string().nullable(),
  budget: z.number(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});

type ResTypeCategory = InferResponseType<typeof client.api.categories.$post>


const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
});

type ResponseType = InferResponseType<typeof client.api.accounts.$post>

const AccountSchema = z.object({
  name: z.string(),
});

type AccountCreate = InferRequestType<typeof client.api.accounts.$post>["json"]

const model:RunnableLike = new ChatOpenAI({
    model: "gpt-4o",
    apiKey: "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"
  });

  const model2:RunnableLike = new ChatOpenAI({
    model: "gpt-4o",
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
const detailsTransactionsSchema = z.object({
  name: z.string().nullable(),
  quantity: z.number().nullable(),
  unitPrice: z.number().nullable(),
  amount: z.number(),
  categoryId: z.string().nullable(),
  projectId: z.string().nullable(),
});


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



export const DataGenerator = async ( guideLine:string ) => {

  const allReadyGeneratedTransactions = [

  ]



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


  `

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


  const dataGenPrompt: RunnableLike = await  ChatPromptTemplate.fromMessages([
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

corresponding output : {{
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
      "amount": -150000,
      "detailsTransactions": [
        {{
          "name": "Organic Spinach (2kg)",
          "quantity": 10,
          "unitPrice": 10000,
          "amount": -100000,
          "categoryId": "Groceries",
          "projectId": null
        }},
        {{
          "name": "Free-Range Chicken Breasts (1kg)",
          "quantity": 5,
          "unitPrice": 10000,
          "amount": -50000,
          "categoryId": "Groceries",
          "projectId": null
        }}
      ],
      "payee": "İstanbul Organic Marketplace",
      "notes": "Weekly groceries",
      "date": "2023-11-15",
      "projectId": null,
      "accountId": "Turkiye Garanti Bankası (Garanti BBVA)",
      "categoryId": "Groceries"
    }},
    {{
      "amount": -40000,
      "detailsTransactions": [
        {{
          "name": "Istanbul University Shuttle Service",
          "quantity": 1,
          "unitPrice": 40000,
          "amount": -40000,
          "categoryId": "Transportation",
          "projectId": null
        }}
      ],
      "payee": "İstanbul Ulaşım A.Ş.",
      "notes": "Trip to Istanbul University",
      "date": "2023-11-16",
      "projectId": null,
      "accountId": "Turkiye Garanti Bankası (Garanti BBVA)",
      "categoryId": "Transportation"
    }},
    {{
      "amount": -50000,
      "detailsTransactions": [
        {{
          "name": "İstanbul Su Dağıtım - Monthly Water Bill",
          "quantity": 1,
          "unitPrice": 50000,
          "amount": -50000,
          "categoryId": "Utilities",
          "projectId": null
        }}
      ],
      "payee": "İstanbul Su Dağıtım",
      "notes": "Monthly water bill",
      "date": "2023-11-17",
      "projectId": null,
      "accountId": "Turkiye Garanti Bankası (Garanti BBVA)",
      "categoryId": "Utilities"
    }},
    {{
      "amount": -100000,
      "detailsTransactions": [
        {{
          "name": "Elite French Tutors - Monthly Lessons",
          "quantity": 1,
          "unitPrice": 100000,
          "amount": -100000,
          "categoryId": "Education",
          "projectId": null
        }}
      ],
      "payee": "Elite French Tutors",
      "notes": "French lessons for children",
      "date": "2023-11-18",
      "projectId": null,
      "accountId": "Turkiye Garanti Bankası (Garanti BBVA)",
      "categoryId": "Education"
    }},
    {{
      "amount": -75000,
      "detailsTransactions": [
        {{
          "name": "Appetizer - Hummus Platter",
          "quantity": 2,
          "unitPrice": 15000,
          "amount": -30000,
          "categoryId": "Dining Out",
          "projectId": null
        }},
        {{
          "name": "Main Course - Adana Kebap",
          "quantity": 2,
          "unitPrice": 20000,
          "amount": -40000,
          "categoryId": "Dining Out",
          "projectId": null
        }},
        {{
          "name": "Dessert - Baklava",
          "quantity": 1,
          "unitPrice": 5000,
          "amount": -5000,
          "categoryId": "Dining Out",
          "projectId": null
        }}
      ],
      "payee": "Sultan's Kebap House",
      "notes": "Dinner with family friends",
      "date": "2023-11-19",
      "projectId": null,
      "accountId": "Turkiye Garanti Bankası (Garanti BBVA)",
      "categoryId": "Dining Out"
    }},
    {{
      "amount": -35000,
      "detailsTransactions": [
        {{
          "name": "Settlers of Catan Board Game",
          "quantity": 1,
          "unitPrice": 35000,
          "amount": -35000,
          "categoryId": "Entertainment",
          "projectId": null
        }}
      ],
      "payee": "Istanbul Toy Emporium",
      "notes": "Purchase of new board games",
      "date": "2023-11-20",
      "projectId": null,
      "accountId": "Turkiye Garanti Bankası (Garanti BBVA)",
      "categoryId": "Entertainment"
    }},
    {{
      "amount": -45000,
      "detailsTransactions": [
        {{
          "name": "Consultation Fee - General Practitioner",
          "quantity": 1,
          "unitPrice": 20000,
          "amount": -20000,
          "categoryId": "Healthcare",
          "projectId": null
        }},
        {{
          "name": "Blood Test Panel",
          "quantity": 1,
          "unitPrice": 15000,
          "amount": -15000,
          "categoryId": "Healthcare",
          "projectId": null
        }},
        {{
          "name": "Antibiotic Amoxicillin (500mg)",
          "quantity": 2,
          "unitPrice": 2000,
          "amount": -4000,
          "categoryId": "Healthcare",
          "projectId": null
        }}
      ],
      "payee": "İstanbul Medical Center",
      "notes": "Routine health check-up",
      "date": "2023-11-21",
      "projectId": null,
      "accountId": "Turkiye Garanti Bankası (Garanti BBVA)",
      "categoryId": "Healthcare"
    }},
    {{
      "amount": -250000,
      "detailsTransactions": [
        {{
          "name": "November Rent Payment",
          "quantity": 1,
          "unitPrice": 250000,
          "amount": -250000,
          "categoryId": "Rent",
          "projectId": null
        }}
      ],
      "payee": "Emirhan Property Management",
      "notes": "Rent payment for November",
      "date": "2023-11-01",
      "projectId": null,
      "accountId": "Turkiye Garanti Bankası (Garanti BBVA)",
      "categoryId": "Rent"
    }}
  ]
}}


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

for (let week = 0; week < 4; week++){
  console.log(week)
  let succes:boolean = false 

  let attempts = 0;
  console.log(attempts)
  const maxAttempts = 5;
  while (!succes && attempts < maxAttempts){
    attempts++;
    console.log(attempts)
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

