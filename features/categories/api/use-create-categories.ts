import {InferRequestType, InferResponseType} from "hono";
import {useMutation,useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {client} from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.categories.$post>
type RequestType = InferRequestType<typeof client.api.categories.$post>["json"]

export const useCreateCategory =()=>{
    const queryClient=useQueryClient()
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    
    >({
        mutationFn: async (json) =>{
            const personaId = localStorage.getItem('selectedPersona') || "testData"
            const response = await client.api.categories.$post({json},{
                headers: {
                    'X-Persona-ID': personaId,      
                }
            });
            return await  response.json();
        },
        onSuccess : (data)=>{

            if("data" in data){
                const newCategoryId = data.data.id
            }

            toast.success("Category created")
            queryClient.invalidateQueries({ queryKey:["categories"]})
            queryClient.refetchQueries({ queryKey: ["categories"] });
        },
        onError: ()=>{
            
            toast.error("Failed to create account")
        }
    })

    return mutation
}

