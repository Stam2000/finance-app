import axios from "axios"
import { InferRequestType } from "hono";
import {client} from "@/lib/hono"
import { AssistantTool } from "openai/resources/beta/assistants.mjs"

type TransactionCreate = InferRequestType<typeof client.api.transactions.$post>["json"]
type DetailsTransactionCreate = InferRequestType<typeof client.api.detailsTransactions.$post>["json"]
type AccountCreate = InferRequestType<typeof client.api.accounts.$post>["json"]
type CategoryCreate = InferRequestType<typeof client.api.categories.$post>["json"]
type TransactionRequest = (TransactionCreate & ({
    detailsTransactions?: DetailsTransactionCreate
    })
)[]



const fetchCategories = async()=>{
	 try{
		  const response = await axios.get("http://localhost:3000/api/categories")
		  const stringData = JSON.stringify(response.data)
		  return stringData
	 }catch(err){
		  console.error("error fetching transactions",err)
		  if (axios.isAxiosError(err)){
				console.error("Axios details",err.response?.status,err.response?.data)
		  }
				console.error("Unexpected error",err)
	 
		  return null
	 }
}

 const fetchAccounts = async()=>{
	 try{
		  const response = await axios.get("http://localhost:3000/api/acounts")
		  const stringData = JSON.stringify(response.data)
		  return stringData
	 }catch(err){
		  console.error("error fetching transactions",err)
		  if (axios.isAxiosError(err)){
				console.error("Axios details",err.response?.status,err.response?.data)
		  }
				console.error("Unexpected error",err)
	 
		  return null
	 }
 }

const fetchDetailsTransaction = async ({id}:{id?:string})=>{
	 try{
		  const response = await axios.get("http://localhost:3000/api/detailsTransactions",{
				params:{
					 id //transactionId
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
	 
		  return null
	 }
}

const fetchDetailsTransactions= async({from,to}:{from?:string,to?:string})=>{
	 try{
		  const response = await axios.get("http://localhost:3000/api/detailsTransactions",{
				params:{
					 from,
					 to,
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
	 
		  return null
	 }
}

const fetchSummary = async({from,to,accountId}:{
	from?: string;
	to?: string;
	accountId?: string;
  })=>{
	 try{
		  const response = await axios.get("http://localhost:3000/api/summary",{
				params:{
					 from,
					 to,
					 accountId
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
	 
		  return null
	 }
}

const fetchTransactions = async ({from,to,accountId}:{
	from?: string;
	to?: string;
	accountId?: string;
  })=>{
	 try{

		  const response = await axios.get("http://localhost:3000/api/transactions",{
				params:{
					 from,
					 to,
					 accountId
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
	 
		  return null
	 }
}
const getTodaysDate =  async () => {
		 const todayDate = new Date()
		 return todayDate.toString()
	}

	const createOneTransaction = async(input:string)=>{
		let json:TransactionCreate = await JSON.parse(input)
	 try {
		 const response = await axios.post("http://localhost:3000/api/transactions", json);
		 return { success: true, data: response.data };
	   } catch (err) {
		 return { success: false, error: err instanceof Error ? err.message : String(err) };
	   }
	 
 }
 
 
 const createOneDetailsTransactions = async(input:string)=>{
	 let json:DetailsTransactionCreate = await JSON.parse(input)
	 try {
		 const response = await axios.post("http://localhost:3000/api/detailsTransactions", json);
		 return { success: true, data: response.data };
	   } catch (err) {
		 return { success: false, error: err instanceof Error ? err.message : String(err) };
	   }
 }
 
 
 const createAccount = async(input:string)=>{
	 let json:AccountCreate = await JSON.parse(input)
	 try {
		 const response = await axios.post("http://localhost:3000/api/accounts", json);
		 return { success: true, data: response.data };
	   } catch (err) {
		 return { success: false, error: err instanceof Error ? err.message : String(err) };
	   }
 }
 
 const createCategory = async(input:string)=>{
	 let json:CategoryCreate = await JSON.parse(input)
	 try {
		 const response = await axios.post("http://localhost:3000/api/categories", json);
		 return { success: true, data: response.data };
	   } catch (err) {
		 return { success: false, error: err instanceof Error ? err.message : String(err) };
	   }
 }
 
 
 const createTransactionsAndDetails = async (input:string)=>{
	 let json:TransactionRequest = await JSON.parse(input)
 try{
	 let response =[]
		 
				 for(const transaction of json){
					 const detailsTransaction = transaction["detailsTransactions"]
					 delete transaction["detailsTransactions"]
					 const responseTransaction = await client.api.transactions.$post({json:transaction})
					 const {data} = await responseTransaction.json()
					 if(detailsTransaction){
						 detailsTransaction.transactionId= data.id
						 const responseDetail = await client.api.detailsTransactions.$post({json:detailsTransaction})
						 response = [...response,{transaction:data,detailsTransaction:await responseDetail.json()}]
						 continue
					 }
				 response = [...response,{data}]
				 }
 
				 return response
			 }catch(err){
				 return { success: false, error: err instanceof Error ? err.message : String(err) }
			 }
	
 }
 

//TODO build function whitch get the actual Date
export const functions = {
	getTodaysDate,
	fetchCategories,
	fetchAccounts,
	fetchSummary,
	fetchoneDetailsTransaction:fetchDetailsTransaction,
	fetchManyDetailsTransactions:fetchDetailsTransactions,
	fetchTransactions,
	createOneTransaction,
	createOneDetailsTransactions,
	createAccount,
	createCategory,
	createTransactionsAndDetails
}

export const handleRequiresAction = async (run,openai,threadId)=>{
	
	const runId = run.id
	/* console.log(runId) */
	if (
		run.required_action &&
		run.required_action.submit_tool_outputs &&
		run.required_action.submit_tool_outputs.tool_calls
	  ) {
		/* console.log(run) */
		const toolOutputs =[]
		for(const tool of run.required_action.submit_tool_outputs.tool_calls){
			if(tool.function.arguments){
				const args = JSON.parse(tool.function.arguments)
				/* console.log(args)
				console.log(functions)
				console.log(tool.function.name) */
				const Output = await functions[tool.function.name](args)
				/* console.log(`####----#####----#####----####----###### /n ${Output} /n + ####----#####----#####----####----######`) */
				toolOutputs.push({
					tool_call_id:tool.id,
					output:Output.toString()
				})
			}else{

				const Output = await functions[tool.function.name]()
				toolOutputs.push({
					tool_call_id:tool.id,
					output:Output.toString()
				})
			}
		}
		/* console.log(toolOutputs) */
		
		if(toolOutputs.length > 0){
			/* console.log(run.id) */
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
		/* console.log(run) */
	  }

	 /*  console.log(run) */

	  return handleRunStatus(run,openai,threadId)
}


export const handleRunStatus = async (run,openai,threadId) => {

	  if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(
          run.thread_id
        )
        console.log(messages.data)
		/* console.log(messages.data.reverse().content[0]?.text?.value) */
		/* console.log(messages.data.content[0]?.text?.value) */
        const aiResponse =  messages.data[0].content[0].text.value
		/* console.log(`###---###---###---###---###---###---###---###---###---###---###---###---###---###---###---###--- 
			  											${aiResponse}   
		 			###---###---###---###---###---###---###---###---###---###---###---###---###---###---###---###---`) */
        return aiResponse
      } else if (run.status === "requires_action") {
	  /* console.log(run.status); */
	  return await handleRequiresAction(run,openai,threadId);
	} else {
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

