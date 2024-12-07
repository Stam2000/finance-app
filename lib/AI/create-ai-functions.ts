import axios from "axios";
import {DynamicTool} from "@langchain/core/tools"
import { InferRequestType } from "hono";
import {client} from "@/lib/hono"
import OpenAI from "openai"

type TransactionCreate = InferRequestType<typeof client.api.transactions.$post>["json"]
type DetailsTransactionCreate = InferRequestType<typeof client.api.detailsTransactions.$post>["json"]
type AccountCreate = InferRequestType<typeof client.api.accounts.$post>["json"]
type CategoryCreate = InferRequestType<typeof client.api.categories.$post>["json"]
type TransactionRequest = (TransactionCreate & ({
    detailsTransactions?: DetailsTransactionCreate
    })
)[]


export const openai = new OpenAI({
    apiKey:"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"
})


const createOneTransactionDef = async(input:string)=>{
       let json:TransactionCreate = await JSON.parse(input)
    try {
        const response = await axios.post("http://localhost:3000/api/transactions", json);
        return { success: true, data: response.data };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      }
    
}


const createOneDetailsTransactionsDef = async(input:string)=>{
    let json:DetailsTransactionCreate = await JSON.parse(input)
    try {
        const response = await axios.post("http://localhost:3000/api/detailsTransactions", json);
        return { success: true, data: response.data };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      }
}


const createAccountDef = async(input:string)=>{
    let json:AccountCreate = await JSON.parse(input)
    try {
        const response = await axios.post("http://localhost:3000/api/accounts", json);
        return { success: true, data: response.data };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      }
}

const createCategoryDef = async(input:string)=>{
    let json:CategoryCreate = await JSON.parse(input)
    try {
        const response = await axios.post("http://localhost:3000/api/categories", json);
        return { success: true, data: response.data };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      }
}


const createTransactionsAndDetailsDef = async (input:string)=>{
    let json:TransactionRequest = await JSON.parse(input)
try{
    let response:any =[]
        
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

const createOneTransaction = new DynamicTool({
    name: "createOneTransaction",
    description: ``,
    func: async (input) => {
        const response = await createOneTransactionDef(input)
        return response
    }
})

const createOneDetailsTransactions = new DynamicTool({
    name: "createOneDetailsTransactions",
    description: ``,
    func: async (input) => {
        const response = await createOneDetailsTransactionsDef(input)
        return response
    }
})

const createOneAccount = new DynamicTool({
    name: "createOneAccount",
    description: ``,
    func: async (input) => {
        const response = await createAccountDef(input)
        return response
    }
})

const createOneCategory = new DynamicTool({
    name: "createOneCategory",
    description: ``,
    func: async (input) => {
        const response = await createCategoryDef(input)
        return response
    }
})

const createTransactionsAndDetails = new DynamicTool({
    name: "createTransactionsAndDetails",
    description: ``,
    func: async (input) => {
        const response = await createTransactionsAndDetailsDef(input)
        return response
    }
})

export const createTools = [createOneTransaction,
        createOneDetailsTransactions,
        createOneAccount,
        createOneCategory,
        createTransactionsAndDetails]



     