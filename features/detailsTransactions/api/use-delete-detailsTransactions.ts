import {InferRequestType, InferResponseType} from "hono";
import {useMutation,useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {client} from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.detailsTransactions["bulk-delete"]["$post"]>
type RequestType = InferRequestType<typeof client.api.detailsTransactions["bulk-delete"]["$post"]>["json"]

export const useDeleteTransactions =()=>{
    const queryClient=useQueryClient()
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    
    >({
        mutationFn: async (json) =>{
            const personaId = localStorage.getItem('selectedPersona') || "testData"
            const response = await client.api.detailsTransactions["bulk-delete"]["$post"]({json},{
                headers: {
                    'X-Persona-ID': personaId,      
                }
            });
            const res = await response.json();

            return res;
        },
        onSuccess : ()=>{
            toast.success("details deleted")
            queryClient.invalidateQueries({queryKey:["detailsTransactions"]})
            queryClient.invalidateQueries({queryKey:["transactions"]})
        },
        onError: ()=>{     
            toast.error("Failed to delete details")
        }
    });
        

    return mutation
}

