
import { toast } from "sonner";
import {InferRequestType, InferResponseType} from "hono";
import {useMutation,useQueryClient } from "@tanstack/react-query";
import {client} from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.categories[":id"]["$delete"]>


export const useDeleteCategory =(id:string)=>{
    const queryClient=useQueryClient()
    const mutation = useMutation<
        ResponseType,
        Error  
    >({
        mutationFn: async () =>{
            const personaId = localStorage.getItem('selectedPersona') || "testData"
            const response = await client.api.categories[":id"]["$delete"]({
                param:{id},
            },{
                headers: {
                    'X-Persona-ID': personaId,      
                }
            });
            return await response.json();
        },
        onSuccess : ()=>{
            toast.success("Account deleted")
            queryClient.invalidateQueries({ queryKey:["categories",{id}]})
            queryClient.invalidateQueries({ queryKey:["categories"]})
        },
        onError: ()=>{
            
            toast.error("Failed to delete account")
        }
    });
        

    return mutation
}

