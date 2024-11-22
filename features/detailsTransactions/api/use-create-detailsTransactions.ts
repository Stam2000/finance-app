import {InferRequestType, InferResponseType} from "hono";
import {useMutation,useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {client} from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.detailsTransactions.$post>
type RequestType = InferRequestType<typeof client.api.detailsTransactions.$post>["json"]

export const useCreateDetailsTransaction =()=>{
    const queryClient=useQueryClient()
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    
    >({
        mutationFn: async (json) =>{
            const personaId = localStorage.getItem('selectedPersona') || "testData"
            const response = await client.api.detailsTransactions.$post({json},{
                headers: {
                    'X-Persona-ID': personaId,      
                }
            });
            return await  response.json();
        },
        onSuccess : ()=>{
            toast.success("Transaction created")
            queryClient.invalidateQueries({ queryKey:["detailsTransactions"]})
             queryClient.invalidateQueries({ queryKey:["transactions"]})

        },
        onError: ()=>{
            
            toast.error("Failed to create transaction")
        }
    })

    return mutation
}

