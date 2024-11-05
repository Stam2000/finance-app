import {client} from "@/lib/hono"
import { useMutation,useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner" 
import { InferRequestType,InferResponseType } from "hono"

type ResponseType = InferResponseType<typeof client.api.transactions["bulk-delete"]["$post"]>
type RequestType = InferRequestType<typeof client.api.transactions["bulk-delete"]["$post"]>["json"]

export const useBulkDeleteTransactions = ()=>{
    const queryClient = useQueryClient()

    const mutation = useMutation<
    ResponseType,
    Error,
    RequestType>({
        mutationFn: async (json)=>{
            console.log(json)
            const response = await client.api.transactions["bulk-delete"]["$post"]({json})
            return await response.json()
        },
        onSuccess:()=>{
            toast.success("Succesful Deleted")
            queryClient.invalidateQueries({queryKey:["transactions"]});
            queryClient.invalidateQueries({queryKey:["summary"]})
        },
        onError:()=>{
            toast.error("Failed to create transactions")
        }
    })

    return mutation
}