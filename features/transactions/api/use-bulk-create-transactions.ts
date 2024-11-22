import {client} from "@/lib/hono"

import { toast } from "sonner"
import { InferRequestType,InferResponseType } from "hono"
import { useMutation,useQueryClient } from "@tanstack/react-query"

type ResponseType = InferResponseType<typeof client.api.transactions["bulk-create"]["$post"]>
type RequestType = InferRequestType<typeof client.api.transactions["bulk-create"]["$post"]>["json"]

export const useBulkCreateTransactions = () => {

    const queryClient = useQueryClient()
    const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
    >({
        
        mutationFn: async (json)=>{
             const personaId = localStorage.getItem('selectedPersona') || "testData"
            const response = await client.api.transactions["bulk-create"]["$post"]({json},{
                headers: {
                    'X-Persona-ID': personaId,      
                }
            })
            return await response.json()
        },
        onSuccess: ()=>{
            toast.success("Transactions created")
            queryClient.invalidateQueries({queryKey:["transactions"]})
            queryClient.invalidateQueries({queryKey:["summary"]})
        },
        onError: ()=>{
            toast.error("Failed to create details")
        }
    })

 return mutation
}

