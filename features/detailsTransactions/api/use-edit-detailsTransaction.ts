import {InferRequestType, InferResponseType} from "hono";
import {useMutation,useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {client} from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.detailsTransactions[":id"]["$patch"]>
type RequestType = InferRequestType<typeof client.api.detailsTransactions[":id"]["$patch"]>["json"]

export const useEditDetailsTransaction =(id?:string)=>{
    const queryClient=useQueryClient()
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async (json) =>{
            console.log(id)
            console.log(json)
            const response = await client.api.detailsTransactions[":id"]["$patch"]({param:{id},json});
            return await  response.json();
        },
        onSuccess : ()=>{
            toast.success("details updated")
            queryClient.invalidateQueries({ queryKey:["detailsTransaction",{id}]})
            queryClient.invalidateQueries({queryKey:["deetailsTransactions"]})
            queryClient.invalidateQueries({ queryKey:["transactions",{id}]})
            queryClient.invalidateQueries({queryKey:["transactions"]})
        },
        onError: ()=>{
            
            toast.error("Failed to update details")
        }
    })

    return mutation
}

