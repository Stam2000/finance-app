import {InferRequestType, InferResponseType} from "hono";
import {useMutation,useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {client} from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.accounts["bulk-delete"]["$post"]>
type RequestType = InferRequestType<typeof client.api.accounts["bulk-delete"]["$post"]>["json"]

export const useDeleteAccounts =()=>{
    const queryClient=useQueryClient()
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    
    >({
        mutationFn: async (json) =>{
            console.log(json)
            const response = await client.api.accounts["bulk-delete"]["$post"]({json});
            const res = await response.json();
            console.log (res)
            return res;
        },
        onSuccess : ()=>{
            toast.success("Account deleted")
            queryClient.invalidateQueries({ queryKey:["accounts"]})
        },
        onError: ()=>{
            
            toast.error("Failed to delete account")
        }
    });
        

    return mutation
}

