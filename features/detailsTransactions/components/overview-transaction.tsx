import {z} from "zod"

import { cn } from "@/lib/utils"
import React from "react"
import { insertdetailsTransactionsSchema} from "@/db/schema"
import { Dialog,
        DialogContent,
        DialogDescription,
        DialogFooter,
        DialogHeader,
        DialogTitle 
    } from "@/components/ui/dialog2"
import { useGetTransaction } from "@/features/transactions/api/use-get-transaction"
import { useDeleteTransaction } from "@/features/transactions/api/use-delete-transaction"
import { useOpenTransactionOverview } from "../hooks/use-openoverview"
import { DataTable} from "@/app/dashboard/transactions/data-table"
import {columns} from "@/app/dashboard/transactions/columns"
import { Button } from "@/components/ui/button"



const apiSchema = insertdetailsTransactionsSchema.omit({
})
type ApiValues = z.input<typeof apiSchema>

export const OverviewTransactionDialog =()=>{
    const filters = ["payee","category","account"]
    const transactions = []
    const {onClose,id,isOpen} = useOpenTransactionOverview()
    const transactionQuery = useGetTransaction(id)
    const transaction = transactionQuery.data
   transaction ? transactions.push(transaction[0]) : []
    const deleteMutation = useDeleteTransaction(id)

    const isDisabled = transactionQuery.isLoading || deleteMutation.isPending

    return(
        <Dialog  open={isOpen}  onOpenChange={onClose} >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Overview Transaction
                    </DialogTitle>
                </DialogHeader>
               
                <DataTable
                    filterKeys={filters}
                    columns={columns}
                    data={transactions}
                    disabled={isDisabled}
                    onDelete={()=>{
                    deleteMutation.mutate()
                    }}
                />
                <DialogFooter>
                    <Button variant={"destructive"} onClick={onClose}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
   
}