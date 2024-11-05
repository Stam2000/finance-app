import {InferRequestType, InferResponseType} from "hono";
import {useMutation,useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {client} from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.projects[":id"]["$patch"]>
type RequestType = InferRequestType<typeof client.api.projects[":id"]["$patch"]>["json"]

export const useEditProject =(id?:string)=>{
    const queryClient=useQueryClient()
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async (json) =>{
            console.log(json)
            const response = await client.api.projects[":id"]["$patch"]({param:{id},json});
            return await  response.json();
        },
        onSuccess : ()=>{
            toast.success("Project updated")
            queryClient.invalidateQueries({ queryKey:["projects",{id}]})
            queryClient.invalidateQueries({queryKey:["projects"]})
        },
        onError: ()=>{
            
            toast.error("Failed to create project")
        }
    })

    return mutation
}

