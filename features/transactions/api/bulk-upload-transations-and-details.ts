import { toast } from "sonner";
import {z} from "zod"
import {client} from "@/lib/hono"
import { InferResponseType,InferRequestType } from "hono";
import { useMutation,useQueryClient } from "@tanstack/react-query";

type detailsTransactionsRequest = InferRequestType<typeof client.api.detailsTransactions["$post"]>["json"]
type TransactionResponse = InferResponseType<typeof client.api.transactions["$post"]>
type BaseTransactionRequest = InferRequestType<typeof client.api.transactions["$post"]>["json"]
type TransactionRequest = (BaseTransactionRequest & ({
    detailsTransactions?: detailsTransactionsRequest
    })
)[]

export const useBulkCreateTransactionsAndDetails = ()=>{
    const queryClient = useQueryClient()
    const mutation =useMutation
    <TransactionResponse,
        Error,
    TransactionRequest>({
        mutationFn: async (json)=>{

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
        },
        onSuccess : ()=>{
            toast.success("Transactions created")
            queryClient.invalidateQueries({queryKey:["transactions"]})
            queryClient.invalidateQueries({queryKey:["detailsTransactions"]})
            queryClient.invalidateQueries({queryKey:["summary"]})
        },
        onError: (error)=>{
            toast.error(`Failed to create details: ${error.message}`)
        }
    })


    return mutation
}