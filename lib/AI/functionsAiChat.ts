import axios from "axios"
import { InferRequestType } from "hono";
import {client} from "@/lib/hono"
import { AssistantTool } from "openai/resources/beta/assistants.mjs"


type TransactionCreate = InferRequestType<typeof client.api.transactions.$post>["json"]
type DetailsTransactionCreate = InferRequestType<typeof client.api.detailsTransactions.$post>["json"]
type AccountCreate = InferRequestType<typeof client.api.accounts.$post>["json"]
type CategoryCreate = InferRequestType<typeof client.api.categories.$post>["json"]
type ProjectCreate = InferRequestType<typeof client.api.projects.$post>["json"]

type TransactionRequest = (TransactionCreate & ({
    detailsTransactions?: DetailsTransactionCreate
    })
)[]

interface RunStatus {
    success?: boolean;
    data?: any; // Adjust this based on actual expected structure
    error?: string;
}

const fetchCategories = async({args,personaId}:{args?:any,personaId:string})=>{
	 try{
		  const response = await axios.get("/api/categories/all",{headers: {
			'X-Persona-ID': personaId,  
		  }})
		  const stringData = JSON.stringify(response.data)
		  return stringData
	 }catch(err){
		  console.error("error fetching Categories",err)
		  if (axios.isAxiosError(err)){
				console.error("Axios details",err.response?.status,err.response?.data)
		  }
				console.error("Unexpected error",err)
		return (`${err}`)
	 }
}

 const fetchAccounts = async({args,personaId}:{args?:any,personaId:string})=>{

	 try{
		  const response = await axios.get("/api/accounts",{headers: {
			'X-Persona-ID': personaId,  
		  }})
		  const stringData = JSON.stringify(response.data)
		  return stringData
	 }catch(err){
		  console.error("error fetching accounts",err)
		  if (axios.isAxiosError(err)){
				console.error("Axios details",err.response?.status,err.response?.data)
		  }
				console.error("Unexpected error",err)
	 
		  return (`${err}`)
	 }
}

 const fetchProjects = async({accountId,personaId}:{accountId?:string,personaId:string})=>{
	try{
		 const response = await axios.get("/api/projects",{params: {
				accountId
			  },headers: {
		   'X-Persona-ID': personaId,  
		 }})
		 const stringData = JSON.stringify(response.data)
		 return stringData
	}catch(err){
		 console.error("error fetching projects",err)
		 if (axios.isAxiosError(err)){
			   console.error("Axios details",err.response?.status,err.response?.data)
		 }
			   console.error("Unexpected error",err)
	
		 return (`${err}`)
	}
}

const fetchDetailsTransaction = async ({id}:{id:string},personaId:string)=>{

	 try{
		  const response = await axios.get("/api/detailsTransactions",{
				params:{
					 id //transactionId
				},
				headers: {
					'X-Persona-ID': personaId,  
				  }
		  })
		  const stringData = JSON.stringify(response.data)
		  return stringData
	 }catch(err){
		  console.error("error fetching details for transactions",err)
		  if (axios.isAxiosError(err)){
				console.error("Axios details",err.response?.status,err.response?.data)
		  }
				console.error("Unexpected error",err)
	 
		  return (`${err}`)
	 }
}

const fetchTransaction = async ({id,personaId}:{id:string,personaId:string})=>{

	try{
		 const response = await axios.get("/api/transactions",{
			   params:{
					id //transactionId
			   },
			   headers: {
				   'X-Persona-ID': personaId,  
				 }
		 })
		 const stringData = JSON.stringify(response.data)
		 return stringData
	}catch(err){
		 console.error("error fetching  for transaction ",err)
		 if (axios.isAxiosError(err)){
			   console.error("Axios details",err.response?.status,err.response?.data)
		 }
			   console.error("Unexpected error",err)
	
		 return (`${err}`)
	}
}

const fetchDetailsTransactions= async({from,to,personaId}:{from?:string,to?:string,personaId:string})=>{
	
	 try{
		  const response = await axios.get("/api/detailsTransactions",{
				params:{
					 from,
					 to,
				},headers: {
					'X-Persona-ID': personaId,  
				  }
		  }) //TODO Modify the input
		  const stringData = JSON.stringify(response.data)
		  return stringData
	 }catch(err){
		  console.error("error fetching transactions",err)
		  if (axios.isAxiosError(err)){
				console.error("Axios details for transactions",err.response?.status,err.response?.data)
		  }
				console.error("Unexpected error",err)
	 
		  return (`${err}`)
	 }
}

/* const fetchSummary = async(input:string,personaId:string)=>{
	const {from,to,accountId}:{
		from?: string;
		to?: string;
		accountId?: string;
	  } = await JSON.parse(input)
	 try{
		  const response = await axios.get("http://localhost:3000/api/summary",{
				params:{
					 from,
					 to,
					 accountId
				},headers: {
					'X-Persona-ID': personaId,  
				  }
		  })
		  const stringData = JSON.stringify(response.data)
		  return stringData
	 }catch(err){
		  console.error("error fetching transactions",err)
		  if (axios.isAxiosError(err)){
				console.error("Axios details",err.response?.status,err.response?.data)
		  }
				console.error("Unexpected error",err)
	 
		  return (`${err}`)
	 }
} */

const fetchTransactions = async ({from,to,accountId,personaId}:{
	from?: string;
	to?: string;
	accountId?: string;
	personaId:string
  })=>{

	 try{

		  const response = await axios.get("/api/transactions",{
				params:{
					 from,
					 to,
					 accountId
				},headers: {
					'X-Persona-ID': personaId,  
				  }
		  })
		  const stringData = JSON.stringify(response.data)
		  return stringData

	 }catch(err){
				console.error("error fetching transactions",err)
		  if (axios.isAxiosError(err)){
				console.error("Axios details",err.response?.status,err.response?.data)
		  }
				console.error("Unexpected error",err)
	 
		  return (`${err}`)
	 }
}

const getTodaysDate =  async ({personaId}:{personaId?:string}) => {
		 const todayDate = new Date()
		 return todayDate.toString()
}

const createOneTransaction = async({
	personaId,
	...json
  }: {
	accountId: string;
	date: Date;
	amount: number;
	payee: string;
	notes?: string | null | undefined;
	projectId?: string | null | undefined;
	categoryId?: string | null | undefined;
	personaId: string;
  })=>{
	 try {
		 const response = await axios.post("/api/transactions", json,{
			headers: {
				'X-Persona-ID': personaId,  
			  }
		 });
		 return JSON.stringify({success: true, data: response.data });
		}catch(err){
			console.error("error inserting transaction",err)
	  if (axios.isAxiosError(err)){
			console.error("Axios details",err.response?.status,err.response?.data)
	  }
			console.error("Unexpected error",err)
 
	  return (`${err}`)
 }
}

 
const createOneDetailsTransactions = async({
	personaId,
	...json
  }:{
    amount: number;
    transactionId: string;
    name?: string | null | undefined;
    projectId?: string | null | undefined;
    categoryId?: string | null | undefined;
    quantity?: number | null | undefined;
    unitPrice?: number |  undefined;
	personaId:string
})=>{
	
	 try {
		 const response = await axios.post("/api/detailsTransactions", json,{
			headers: {
				'X-Persona-ID': personaId,  
			  }
		 });
		 return JSON.stringify({ success: true, data: response.data });
		}catch(err){
			console.error("error creating detail for transaction",err)
	  if (axios.isAxiosError(err)){
			console.error("Axios details",err.response?.status,err.response?.data)
	  }
			console.error("Unexpected error",err)
 
	  return (`${err}`)
 }
}
 
 
const createAccount = async({
	personaId,
	...json
  }:{
    name: string;
	personaId:string
})=>{

	 try {
		 const response = await axios.post("/api/accounts", json,{
			headers: {
				'X-Persona-ID': personaId,  
			  }
		 });
		 return JSON.stringify({ success: true, data: response.data });
		}catch(err){
			console.error("error creating account",err)
	  if (axios.isAxiosError(err)){
			console.error("Axios details",err.response?.status,err.response?.data)
	  }
			console.error("Unexpected error",err)
 
	  return (`${err}`)
 }
}
 
const createCategory = async({
	personaId,
	...json
  }:{
    name: string;
    goal?: number | null | undefined;
	personaId:string
})=>{
	 
	 try {
		 const response = await axios.post("/api/categories", json,{
			headers: {
				'X-Persona-ID': personaId,  
			  }
		 });
		 return JSON.stringify({ success: true, data: response.data });
		}catch(err){
			console.error("error creating accounts",err)
	  if (axios.isAxiosError(err)){
			console.error("Axios details",err.response?.status,err.response?.data)
	  }
			console.error("Unexpected error",err)
 
	  return (`${err}`)
 }
}
 
 
const createTransactionsAndDetails = async ({
	personaId,
	...json
  }:{
	personaId:string;
	transactions:{
    date: Date;
    accountId: string;
    amount: number;
    payee: string;
    notes?: string | null | undefined;
    projectId?: string | null | undefined;
    categoryId?: string | null | undefined;
	detailsTransactions:{
    amount: number;
    transactionId: string;
    name: string 
    projectId?: string | null | undefined;
    categoryId?: string | null | undefined;
    quantity: number 
    unitPrice: number
}[]
}[]})=>{
 try{
	 let response:any =[]
		 
	 for(const transaction of json.transactions){
		const detailsTransaction = transaction["detailsTransactions"]
		const {detailsTransactions, ...transacToUp} = transaction
		/* const timestamp = Date.parse(transacToUp.date); */
		const responseTransaction = await client.api.transactions.$post({json:transaction},{
		  headers: {
			  'X-Persona-ID': personaId,  
		  }
	  })
		const {data} = await responseTransaction.json()
		console.log(data)
		if(detailsTransaction){

			let completeDetailsTransaction = await Promise.all(
				detailsTransaction.map(async (d) => {
					console.log(data.id)
				  const responseDetail = await client.api.detailsTransactions.$post({
					json: { ...d, transactionId: data.id }
				  },{headers: {
					'X-Persona-ID': personaId,  
				}});

				  const ress = await responseDetail.json()

				  console.log(ress)
				  return responseDetail;
				})
			  );

			response.push({
				transaction: data,
				detailsTransactions: completeDetailsTransaction,
			  })
		}
	}
				return response

				}catch(err){
					console.error("error creating transactions and details transactions ",err)
			  if (axios.isAxiosError(err)){
					console.error("Axios details",err.response?.status,err.response?.data)
			  }
					console.error("Unexpected error",err)
		 
			  return (`${err}`)
		 }
}
	

const createProject = async({
	personaId,
	...json
  }:{
    name: string;
    budget: number;
    startDate: string;
    endDate: string;
    description?: string | undefined;
	personaId:string
})=>{

	 try {
		 const response = await axios.post("/api/projects", json,{
			headers: {
				'X-Persona-ID': personaId,  
			  }
		 });
		 return JSON.stringify({ success: true, data: response.data });
		}catch(err){
			console.error("error fetching transactions",err)
	  if (axios.isAxiosError(err)){
			console.error("Axios details",err.response?.status,err.response?.data)
	  }
			console.error("Unexpected error",err)
 
	  return (`${err}`)
 }
} 

//TODO build function whitch get the actual Date
export const functions : any = {
	getTodaysDate,
	fetchCategories,
	fetchProjects,
	fetchAccounts,
	fetchOneTransaction:fetchTransaction,
	fetchOneDetailsTransaction:fetchDetailsTransaction,
	fetchManyDetailsTransactions:fetchDetailsTransactions,
	fetchTransactions,
	createOneTransaction,
	createOneDetailsTransactions,
	createAccount,
	createCategory,
	createProject,
	createTransactionsAndDetails
}

export const handleRequiresAction = async ( run: any,
    openai: any,
    threadId: any,
	personaId:string
): Promise<RunStatus | null>=>{
	
	const runId = run.id
	/* console.log(runId) */
	if (
		run.required_action &&
		run.required_action.submit_tool_outputs &&
		run.required_action.submit_tool_outputs.tool_calls
	  ) {
		console.log(run)
		const toolOutputs =[]
		const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
		console.log(toolCalls)

// Map each tool call to a Promise
const promises = toolCalls.map(async (tool:any) => {
    try {
        let output;

        if (tool.function.arguments) {
            // Parse the arguments, handling date fields
            const args = JSON.parse(tool.function.arguments, (key, value) =>
                key === "date" ? new Date(value) : value
            );

            console.log('Arguments:', args);
            console.log('Functions:', functions);
            console.log('Function Name:', tool.function.name);

            // Execute the function with arguments and personaId
            output = await functions[tool.function.name]({ ...args, personaId });

            console.log(`####----#####----#####----####----###### \n ${output} \n ####----#####----#####----####----######`);
        } else {
            // Execute the function without arguments
            output = await functions[tool.function.name]();
        }

        // Return the formatted output object
        return {
            tool_call_id: tool.id,
            output: output.toString(),
        };
    } catch (error:any) {
        console.error(`Error executing tool ${tool.id}:`, error);
        // Handle the error as needed, for example:
        return {
            tool_call_id: tool.id,
            output: `Error: ${error.message}`,
        };
    }
});

// Await all Promises to complete
const results = await Promise.all(promises);

// Populate the toolOutputs array with the results
toolOutputs.push(...results);

		
		if(toolOutputs.length > 0){

			try{
				run = await openai.beta.threads.runs.submitToolOutputsAndPoll(
				threadId,
				run.id,
				{ tool_outputs: toolOutputs },
			  );	
			}catch(err){
				console.log("err")
			}
			
			}

	  }


	  return handleRunStatus(run,openai,threadId,personaId)
}


export const handleRunStatus = async (run:any,openai:any,threadId:string,personaId:string) => {

	  if (run.status === 'completed') {
		const messages = await openai.beta.threads.messages.list(run.thread_id);

		// Log the response to inspect its structure
		console.log(messages.data);
	
		// Retrieve the most recent AI message
		const latestMessage = messages.data.find(
		  (message: any) => message.role === 'assistant'
		);
	
		if (!latestMessage) {
		  console.error('No assistant message found in the thread.');
		  return null;
		}
	
		// Extract the AI response text
		const aiResponse =
		  latestMessage.content?.[0]?.text?.value || 'No response content available';
	
		console.log(
		  `###---###---###---###---###---###---###---###---###---###---###---###---###
				${aiResponse}
		  ###---###---###---###---###---###---###---###---###---###---###---###---###`
		);
	
		return aiResponse;
      } else if (run.status === "requires_action") {
	  console.log(run.status);
	  return await handleRequiresAction(run,openai,threadId,personaId);
	} else {
		console.log(run.status);
	  console.error("Run did not complete:", run);
	}

  };


export const SystemPrompt =`You are an assistant specialized in financial analysis and management. Your primary function is to help users understand and manage their financial data, including transactions, accounts, and spending patterns. You have access to several API functions that allow you to fetch and analyze financial information.
						  Your capabilities include:

						
						  Get the actual date
						  Fetching and analyzing transaction data
						  Retrieving account information
						  Accessing and interpreting transaction details
						  Generating financial summaries
						  Categorizing expenses
						  Comparing financial data across different time periods

						  When interacting with users, you should:

						  Provide clear and concise financial insights
						  Offer helpful suggestions for financial management
						  Answer questions about transactions, spending habits, and account balances
						  Alert users to significant changes or patterns in their financial data
						  Assist in budget planning and expense tracking
						  Explain financial concepts in simple terms when necessary

						  You have access to the following functions to retrieve data:

						  fetchTransaction: Get transaction data for a specified period
						  fetchCategories: Retrieve available expense categories
						  fetchAccounts: Get a list of user accounts
						  fetchDetailsTransaction: Get detailed information about a specific transaction
						  fetchDetailsTransactions: Retrieve details for multiple transactions in a given period
						  fetchSummary: Generate a comprehensive financial summary for a specified period
						  getTodaysDate: Get the current date for reference

						  Always prioritize user privacy and data security. Do not share or expose sensitive financial information. If you're unsure about any financial advice, recommend that the user consult with a professional financial advisor.

						  Remember, your goal is to help users make informed financial decisions and better understand their financial situation.`

export const openAiTools:AssistantTool[]=[
	{
		type: "function",
		function: {
			name: "getTodaysDate",
			description: "Gets the current date using JavaScript's Date object and returns it as a string representation of today's date.",
			parameters: {},
		}
	},
	{
		type: "function",
		function: {
			name: "moreInformationsForTheAssistant",
			description: `First decide all the step you take before taking actions.keep the langage of the response simple, friendly and the response struture well formated.avoid tables.
			If you need specific data to respond to a query, please make sure that all the data you obtain is fully analyzed.`,
			parameters: {},
		}
	},{
		type: "function",
		function: {
			name: "fetchCategories",
			description: "Fetches category data from a local API endpoint and returns a JSON string containing an array of category objects. If an error occurs, it returns null.",
			parameters: {},
		}
	},
	{
		type: "function",
		function: {
			name: "fetchAccounts",
			description: "Fetches account data from a local API endpoint and returns a JSON string containing an array of account objects. Returns null if there's an error.",
			parameters: {},
		}
	},
	{
    type: "function",
    function: {
      name: "createOneTransaction",
      description: "Create a single financial transaction. Input must be a JSON string containing the transaction details.",
      parameters: {
        type: "object",
        properties: {
          input: {
            type: "string",
            description: "A JSON string containing: accountId (string, required), amount (number, required), payee (string, required), date (string, optional, ISO 8601 format), notes (string, optional), projectId (string, optional), categoryId (string, optional)."
          }
        },
        required: ["input"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createOneDetailsTransactions",
      description: "Create details for a transaction. Input must be a JSON string containing the transaction detail information.",
      parameters: {
        type: "object",
        properties: {
          input: {
            type: "string",
            description: "A JSON string containing: amount (number, required), transactionId (string, required), name (string, optional), projectId (string, optional), categoryId (string, optional), quantity (number, optional), unitPrice (number, optional)."
          }
        },
        required: ["input"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createAccount",
      description: "Create a new account. Input must be a JSON string containing the account information.",
      parameters: {
        type: "object",
        properties: {
          input: {
            type: "string",
            description: "A JSON string containing: name (string, required) - The name of the account."
          }
        },
        required: ["input"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createCategory",
      description: "Create a new category. Input must be a JSON string containing the category information.",
      parameters: {
        type: "object",
        properties: {
          input: {
            type: "string",
            description: "A JSON string containing: name (string, required) - The name of the category, goal (number, optional) - The goal amount for this category."
          }
        },
        required: ["input"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createTransactionsAndDetails",
      description: "Create multiple transactions with their details. Input must be a JSON string containing an array of transactions and their details.",
      parameters: {
        type: "object",
        properties: {
          input: {
            type: "string",
            description: "A JSON string containing an array of transaction objects. Each transaction object should include: accountId (string, required), amount (number, required), payee (string, required), date (string, optional, ISO 8601 format), notes (string, optional), projectId (string, optional), categoryId (string, optional), and detailsTransactions (object, optional) containing: amount (number, required), name (string, optional), projectId (string, optional), categoryId (string, optional), quantity (number, optional), unitPrice (number, optional)."
          }
        },
        required: ["input"]
      }
    }
  }
	,
	{
		type: "function",
		function: {
			name: "fetchoneDetailsTransaction",
			description: "Fetches details of a specific transaction by ID from a local API endpoint. Returns a JSON string containing the transaction details or null if there's an error.",
			parameters: {
				type: "object",
				properties: {
					id: {
						type: "string",
						description: "Optional ID of the transaction to fetch."
					}
				},
				required: []
			},
		}
	},
	{
		type: "function",
		function: {
			name: "fetchManyDetailsTransactions",
			description: "Fetches details of multiple transactions from a local API endpoint based on the provided date range. Returns a JSON string of transaction details or null if an error occurs.",
			parameters: {
				type: "object",
				properties: {
					from: {
						type: "string",
						description: "Starting date in 'yyyy-mm-dd' format for the transaction range, optional.",
						optional: true
					},
					to: {
						type: "string",
						description: "Ending date in 'yyyy-mm-dd' format for the transaction range, optional.",
						optional: true
					}
				},
				required: []
			},
		}
	},
	{
		type: "function",
		function: {
			name: "fetchTransactions",
			description: "Fetches transaction data for a specified date range and account ID from a local API endpoint. Returns a JSON string of transactions or null if an error occurs.",
			parameters: {
				type: "object",
				properties: {
					from: {
						type: "string",
						description: "Starting date in 'yyyy-mm-dd' format for the transaction range, optional.",
						optional: true
					},
					to: {
						type: "string",
						description: "Ending date in 'yyyy-mm-dd' format for the transaction range, optional.",
						optional: true
					},
					accountId: {
						type: "string",
						description: "Optional ID of the account for which to fetch transactions.",
						optional: true
					}
				},
				required: []
			},
		}
	}		
]

