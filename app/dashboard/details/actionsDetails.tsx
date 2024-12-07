"use client"

import { useOpenDetailsTransaction } from "@/features/detailsTransactions/hooks/use-open-details";
import { useDeleteDetailsTransaction } from "@/features/detailsTransactions/api/use-delete-detailsTransaction";
import { useOpenTransactionOverview } from "@/features/detailsTransactions/hooks/use-open-overview";
import { useConfirm } from "@/hooks/use-comform";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Edit,Trash } from "lucide-react";
import { OverviewTransactionDialog } from "@/features/detailsTransactions/components/overview-transaction";
import { EditDetailsTransactionDialog } from "@/features/detailsTransactions/components/edit-detailsTransaction-dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
  import { useState } from "react";



type Props={   
       id:string,
       transactionId:string | null,
}
export const ActionsDetails = ({id,transactionId}:Props)=>{
    const [ConfirmDialog,confirm]= useConfirm(
            "Are you sure?",
            "You are about to delete this transaction."
        )
    
    const [active,setActive]=useState(false)

    const deleteMutation = useDeleteDetailsTransaction(id);
    const {onOpen}=  useOpenDetailsTransaction();
    const {onOpen:onOpenOverview}=  useOpenTransactionOverview();

    const handleDelete = async ()=>{
        const ok = await confirm()

        if(ok){
            deleteMutation.mutate()
        }
    }

    return(
        <>
            <OverviewTransactionDialog/>
            <EditDetailsTransactionDialog/>
            <ConfirmDialog />
            <Popover  onOpenChange={(open) => setActive(open)}>
        <PopoverTrigger asChild>
            <Button variant="ghost"  className={`size-8 p-0 ${active ? "bg-slate-900 text-white":null}`}>
                <MoreHorizontal className="size-4"/>
            </Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-1 ">
            <Button
                disabled={deleteMutation.isPending}
                onClick={()=>{
                    
                    onOpenOverview(transactionId!)}}
               >
                   <Edit className="size-4 mr-2"/>
                   Show Transaction
            </Button>
            <Button
                disabled={deleteMutation.isPending}
                onClick={()=>{
                    
                    onOpen(id)}}
               >
                   <Edit className="size-4 mr-2"/>
                   Edit
            </Button>
            <Button
                disabled={deleteMutation.isPending}
                onClick={handleDelete}
            >
                <Trash className="size-4 mr-2" />
                Delete
            </Button>
        </PopoverContent>
        </Popover>  
        </>
    )
}