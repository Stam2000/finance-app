import {InferRequestType, InferResponseType} from "hono";
import {useMutation,useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {client} from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.projects[":id"]["$patch"]>
type RequestType = InferRequestType<typeof client.api.projects[":id"]["$patch"]>["json"]

export const useEditProject =(id:string)=>{
    const queryClient=useQueryClient()
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async (json) =>{
            const personaId = localStorage.getItem('selectedPersona') || "testData"
            const response = await client.api.projects[":id"]["$patch"]({param:{id},json},{
                headers: {
                    'X-Persona-ID': personaId,      
                }
            });
            return await  response.json();
        },
        onSuccess : ()=>{
            toast.success("Project updated")
            queryClient.invalidateQueries({ queryKey:["projects",{id}]})
            queryClient.invalidateQueries({queryKey:["projects"]})
        },
        onError: ()=>{
            
            toast.error("Failed to update project")
        }
    })

    return mutation
}

