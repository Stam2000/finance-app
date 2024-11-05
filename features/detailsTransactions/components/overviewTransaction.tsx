import {z} from "zod"

import { cn } from "@/lib/utils"
import React from "react"
import { insertdetailsTransactionsSchema,detailsTransactions as detailsTransactionSchema } from "@/db/schema"
import { TransactionForm } from "./detailsTransaction-form"
import { Dialog,
        DialogContent,
        DialogDescription,
        DialogFooter,
        DialogHeader,
        DialogTitle 
    } from "@/components/ui/dialog2"

import { useGetTransaction } from "@/features/transactions/api/use-get-transaction"
import { useEditTransaction } from "@/features/transactions/api/use-edit-transaction"
import { useDeleteTransaction } from "@/features/transactions/api/use-delete-transaction"
import { useOpenTransactionOverview } from "../hooks/use-open-Overview"


import { DataTable} from "@/app/(dashboard)/transactions/data-table"
import {columns} from "@/app/(dashboard)/transactions/columns"
import { convertAmountToMiliunits } from "@/lib/utils"
import { useOpenDetailsTransaction } from "../hooks/use-open-details"
import { useOverviewNewDetails } from "../hooks/use-overview-Newdetails"
import {useGetAccounts} from "@/features/accounts/api/use-get-accounts"
import { useCreateAccount } from "@/features/accounts/api/use-create-accounts"
import { Button } from "@/components/ui/button"
import {DetailsTable} from "@/components/columnsDetails"
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction"
import { InferResponseType } from "hono"
import {client} from "@/lib/hono"
import { useBulkCreateDetailsTransactions } from "../api/use-bulk-create-detailsTransactions"

import { useGetCategories } from "@/features/categories/api/use-get-categories"
import { useCreateCategory } from "@/features/categories/api/use-create-categories"


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
    console.log(transactions)
    const isDisabled = transactionQuery.isLoading || deleteMutation.isPending

    return(
        <Dialog  open={isOpen}  onOpenChange={onClose} >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Overview Transaction
                    </DialogTitle>
                    <DialogDescription>
                        Overview of the transaction a new transaction to transaction
                    </DialogDescription>
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
                    <Button onClick={onClose}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
   
}