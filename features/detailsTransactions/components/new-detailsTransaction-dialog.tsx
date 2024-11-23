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
import { convertAmountToMiliunits } from "@/lib/utils"
import { useOpenDetailsTransaction } from "../hooks/use-open-details"
import { useOverviewNewDetails } from "../hooks/use-overview-Newdetails"
import {useGetAccounts} from "@/features/accounts/api/use-get-accounts"
import { useCreateAccount } from "@/features/accounts/api/use-create-accounts"
import { Button } from "@/components/ui/button"
import { useGetProjects } from "@/features/projects/api/use-get-projects"
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

export const NewDetailsTransactionDialog =()=>{
    const{updateDetail,transactionId,detailsTransactions,onClose,isOpen} =  useOverviewNewDetails()
 
    /* const [detailsTransactions,setDetailsTransactions] = React.useState<FormValues[]>([]) */  
    const accountQuery = useGetAccounts()
    const accountMutation = useCreateAccount()

    const categoryQuery = useGetCategories()
    const categoryMutation = useCreateCategory()
    const categoryOptions = (categoryQuery.data ?? []).map(
        (category)=>({
            label:category.name,
            value:category.id
        }))

        const projectQuery = useGetProjects()
        const projectOptions = (projectQuery.data ?? []).map(
            (project)=>({
                label:project.name,
                value:project.id
            }))
    
    const onCreateCategory = (name:string)=>categoryMutation.mutate({name})
    const createDetailsTransactions = useBulkCreateDetailsTransactions()

    const isPending = 
    createDetailsTransactions.isPending ||
    categoryMutation.isPending ||
    accountMutation.isPending;

    const isLoading =
        categoryQuery.isLoading || accountQuery.isLoading || projectQuery ;

    const handleSubmit=()=>{
        const data = detailsTransactions.map((detail)=>{
            const newAmount = convertAmountToMiliunits(detail.amount)
            const newUnitPrice = detail.unitPrice?convertAmountToMiliunits(detail.unitPrice):null
            const newDetail = {...detail,amount:newAmount,unitPrice:newUnitPrice}
            return newDetail

        })

        createDetailsTransactions.mutate(data,{
            onSuccess:()=>{
                onClose()
            }
        })
    }

    return(
        <Dialog  open={isOpen}  onOpenChange={onClose} >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        New Details
                    </DialogTitle>
                    <DialogDescription>
                        Add  new detials for this transaction 
                    </DialogDescription>
                </DialogHeader>
                <div className="flex p-2 justify-between gap-4 " >
                <TransactionForm 
                    onSubmit={updateDetail}
                    disabled={isPending}
                    transactionId={transactionId!}
                    projectOptions={projectOptions}
                    categoryOptions={categoryOptions}
                    onCreateCategory={onCreateCategory}
                />
                
          
                    <DetailsTable detailsTransactions={detailsTransactions} />
                
                </div>
               
                
                <DialogFooter>
                    {detailsTransactions.length &&
                        <Button 
                            onClick={handleSubmit}
                        >
                            Submit
                        </Button>
                    }<Button onClick={onClose}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
   
}