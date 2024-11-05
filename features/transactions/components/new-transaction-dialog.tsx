import {z} from "zod"

import { insertTransactionSchema } from "@/db/schema"
import { TransactionForm } from "./transaction-form"
import { Dialog,
        DialogContent,
        DialogDescription,
        DialogFooter,
        DialogHeader,
        DialogTitle 
    } from "@/components/ui/dialog"
import { useNewTransaction } from "../hooks/use-new-transaction"
import { useCreateTransaction } from "../api/use-create-transactions"
import { useGetProjects } from "@/features/projects/api/use-get-projects"
import {useGetAccounts} from "@/features/accounts/api/use-get-accounts"
import { useCreateAccount } from "@/features/accounts/api/use-create-accounts"
import { Button } from "@/components/ui/button"

import { useGetCategories } from "@/features/categories/api/use-get-categories"
import { useCreateCategory } from "@/features/categories/api/use-create-categories"

const formSchema = insertTransactionSchema.omit({
    id:true,
})

type FormValues = z.input<typeof formSchema>

export const NewTransactionDialog =()=>{
    const {isOpen,onClose} = useNewTransaction()
    
    const accountQuery = useGetAccounts()
    const accountMutation = useCreateAccount()
    const accountOptions = (accountQuery.data ?? []).map((account)=>({
        label:account.name,
        value:account.id
    }))

    const projectQuery = useGetProjects()
    const projectOptions = (projectQuery.data ?? []).map(
        (project)=>({
            label:project.name,
            value:project.id
        }))

    const onCreateAccount =(name:string)=>accountMutation.mutate({name})

    const categoryQuery = useGetCategories()
    const categoryMutation = useCreateCategory()
    const categoryOptions = (categoryQuery.data ?? []).map(
        (category)=>({
            label:category.name,
            value:category.id
        }))
    
    const onCreateCategory = (name:string)=>categoryMutation.mutate({name})
    const createMutation = useCreateTransaction()

    const onSubmit = (values:FormValues)=>{
        createMutation.mutate(values,{
            onSuccess:()=>{
                onClose()
            }
        })
    }

    const isPending = 
    createMutation.isPending ||
    categoryMutation.isPending ||
    accountMutation.isPending;


    return(
        <Dialog open={isOpen}  onOpenChange={onClose} >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        New Transaction
                    </DialogTitle>
                    <DialogDescription>
                        Create a new transaction to transaction
                    </DialogDescription>
                </DialogHeader>
                    <TransactionForm 
                        onSubmit={onSubmit}
                        disabled={isPending}
                        projectOptions={projectOptions}
                        accountOptions={accountOptions}
                        categoryOptions={categoryOptions}
                        onCreateAccount={onCreateAccount}
                        onCreateCategory={onCreateCategory}
                    />
                <DialogFooter>
                    <Button onClick={onClose}>
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
   
}