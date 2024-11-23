
import { toast } from "sonner";
import {InferRequestType, InferResponseType} from "hono";
import {useMutation,useQueryClient } from "@tanstack/react-query";
import {client} from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.projects[":id"]["$delete"]>


export const useDeleteProject =(id:string)=>{
    const queryClient=useQueryClient()
    const mutation = useMutation<
        ResponseType,
        Error  
    >({
        mutationFn: async () =>{
            const personaId = localStorage.getItem('selectedPersona') || "testData"
            const response = await client.api.projects[":id"]["$delete"]({
                param:{id},
            },{
                headers: {
                    'X-Persona-ID': personaId,      
                }});
            return await response.json();
        },
        onSuccess : ()=>{
            toast.success("Project deleted")
            queryClient.invalidateQueries({ queryKey:["projects",{id}]})
            queryClient.invalidateQueries({ queryKey:["projects"]})
        },
        onError: ()=>{
            
            toast.error("Failed to delete projects")
        }
    });
        

    return mutation
}

