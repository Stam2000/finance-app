import {create} from "zustand"
import { InferResponseType } from "hono"
 import {client} from "@/lib/hono"

type ResponseType = InferResponseType<typeof client.api.detailsTransactions.$get,200 >["data"][0]

type OpenTransactionState = {
    id?:string,
 
    isOpen:boolean,
    onOpen:(id:string)=>void,
    onClose:() => void
}

export const useOpenDetailsTransaction = create<OpenTransactionState>((set)=>({
    id:undefined,
    isOpen:false,
    onOpen:(id)=>set({isOpen:true,id}),
    onClose:()=>set({isOpen:false,id:undefined})
})
)