"use client"

import { useDeleteTransaction } from "@/features/transactions/api/use-delete-transaction";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";

import { useConfirm } from "@/hooks/use-comform";
        import {
            Popover,
            PopoverContent,
            PopoverTrigger,
          } from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { EditTransactionDialog } from "@/features/transactions/components/edit-transaction-dialog";
import { Edit,Trash } from "lucide-react";
import { useState } from "react";
import { NewDetailsTransactionDialog } from "@/features/detailsTransactions/components/new-detailsTransaction-dialog";
import { useOverviewNewDetails } from "@/features/detailsTransactions/hooks/use-overview-newdetails";



type Props={
    id:string
}
export const Actions = ({id}:Props)=>{
    const [ConfirmDialog,confirm]= useConfirm(
            "Are you sure?",
            "You are about to delete this transaction."
        )

    const deleteMutation = useDeleteTransaction(id);
    const {onOpen}= useOpenTransaction();
    const{onOpen:onOpenDetails,isOpen} =  useOverviewNewDetails()
    const [active,setActive] = useState(false)



    const handleDelete = async ()=>{
        const ok = await confirm()

        if(ok){
            deleteMutation.mutate()
        }
    }

    return(
        <>
        <ConfirmDialog />
        <NewDetailsTransactionDialog/> 
        <EditTransactionDialog/>
        <Popover  onOpenChange={(open) => setActive(open)}>
        <PopoverTrigger asChild>
            <Button variant="ghost" className={`size-8 p-0 ${active ? "bg-slate-900 text-white":null}`}>
                <MoreHorizontal className="size-4"/>
            </Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-1 ">
            <Button
                disabled={deleteMutation.isPending}
                onClick={()=>onOpen(id)}
            >
                <Edit className="size-4 mr-2"/>
                Edit
            </Button>
            <Button
                disabled={deleteMutation.isPending}
                onClick={()=>onOpenDetails(id)}
            >
                <Edit className="size-4 mr-2"/>
                Add Items
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