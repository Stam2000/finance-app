import {create} from "zustand";
import { insertdetailsTransactionsSchema } from "@/db/schema";
import {z} from "zod"


const apiSchema = insertdetailsTransactionsSchema.omit({
})
type ApiValues = z.input<typeof apiSchema>

type NewTransactionState = {
    detailsTransactions:ApiValues[]
    transactionId?:string;
    isOpen :boolean;
    temporalId:number,
    updateDetail:(detailsTransaction:ApiValues)=>void;
    onOpen:(id:string)=> void;
    onClose:()=> void;
    updateId:()=>void
};

export const useOverviewNewDetails = create<NewTransactionState>((set)=>({
    detailsTransactions:[],
    transactionId:undefined,
    isOpen: false,
    temporalId:0,
    updateId:() => set((state) => ({ temporalId: state.temporalId + 1 })),
    updateDetail:(Newdetail)=>set((state) => ({detailsTransactions: [...state.detailsTransactions,Newdetail]})),
    onOpen:(transactionId)=>set({isOpen:true,transactionId}),
    onClose:()=>set({isOpen:false,transactionId:undefined,detailsTransactions:[],temporalId:0})
}))