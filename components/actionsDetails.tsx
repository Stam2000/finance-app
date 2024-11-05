"use client"

import { useConfirm } from "@/hooks/use-comform";
import { DropdownMenu,
        DropdownMenuContent,
        DropdownMenuItem,
        DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Edit,Trash } from "lucide-react";
import { EditDetailsTransactionDialog } from "@/features/detailsTransactions/components/edit-detailsTransaction-dialog";
import { useOpenDetailsTransaction } from "@/features/detailsTransactions/hooks/use-open-details";
import { useDeleteDetailsTransaction } from "@/features/detailsTransactions/api/use-delete-detailsTransaction";



type Props={   
       id: {detailsId:string,
        transactionId:string|null }
}
export const ActionsDetails = ({id}:Props)=>{
    const [ConfirmDialog,confirm]= useConfirm(
            "Are you sure?",
            "You are about to delete this transaction."
        )

    const deleteMutation = useDeleteDetailsTransaction(id.detailsId);
    const {onOpen}= useOpenDetailsTransaction();

    const handleDelete = async ()=>{
        const ok = await confirm()

        if(ok){
            deleteMutation.mutate()
        }
    }

    return(
        <>
            <EditDetailsTransactionDialog/>
            <ConfirmDialog />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="size-8 p-0">
                        <MoreHorizontal className="size-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                     disabled={deleteMutation.isPending}
                     onClick={()=>onOpen(id.detailsId)}
                    >
                        <Edit className="size-4 mr-2"/>
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        disabled={deleteMutation.isPending}
                        onClick={handleDelete}
                    >
                        <Trash className="size-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}