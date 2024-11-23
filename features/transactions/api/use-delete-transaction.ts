
import { toast } from "sonner";
import {InferRequestType, InferResponseType} from "hono";
import {useMutation,useQueryClient } from "@tanstack/react-query";
import {client} from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.transactions[":id"]["$delete"]>


export const useDeleteTransaction =(id:string)=>{
    const queryClient=useQueryClient()
    const mutation = useMutation<
        ResponseType,
        Error  
    >({
        mutationFn: async () =>{
            const personaId = localStorage.getItem('selectedPersona') || "testData"
            const response = await client.api.transactions[":id"]["$delete"]({
                param:{id},
            },{
                headers: {
                    'X-Persona-ID': personaId,      
                }
            });
            return await response.json();
        },
        onSuccess : ()=>{
            toast.success("Transaction deleted")
            queryClient.invalidateQueries({ queryKey:["transactions",{id}]})
            queryClient.invalidateQueries({ queryKey:["transactions"]})
        },
        onError: ()=>{
            
            toast.error("Failed to delete transaction")
        }
    });
        

    return mutation
}

