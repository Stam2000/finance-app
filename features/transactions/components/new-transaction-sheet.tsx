import {z} from "zod"

import { insertTransactionSchema } from "@/db/schema"
import { TransactionForm } from "./transaction-form"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { useNewTransaction } from "../hooks/use-new-transaction"
import { useCreateTransaction } from "../api/use-create-transactions"
import {useGetAccounts} from "@/features/accounts/api/use-get-accounts"
import { useCreateAccount } from "@/features/accounts/api/use-create-accounts"

import { useGetCategories } from "@/features/categories/api/use-get-categories"
import { useCreateCategory } from "@/features/categories/api/use-create-categories"

const formSchema = insertTransactionSchema.omit({
    id:true,
})

type FormValues = z.input<typeof formSchema>

export const NewTransactionSheet =()=>{
    const {isOpen, onClose} = useNewTransaction()

    const accountQuery = useGetAccounts()
    const accountMutation = useCreateAccount()
    const accountOptions = (accountQuery.data ?? []).map((account)=>({
        label:account.name,
        value:account.id
    }))
    const onCreateAccount = (name:string)=>accountMutation.mutate({
        name
    })

    const categoryQuery = useGetCategories()
    const categoryMutation = useCreateCategory()
    const categoryOptions = (categoryQuery.data ?? []).map((category)=>({
        label:category.name,
        value:category.id,
    }))
    const onCreateCategory = (name:string)=>categoryMutation.mutate({
        name
    })


    const createMutation = useCreateTransaction()
    
    const onSubmit = (values:FormValues) =>{
        createMutation.mutate(values,{
            onSuccess:()=>{
                onClose();
            },
        })
    }

    const isPending = 
    createMutation.isPending ||
    categoryMutation.isPending ||
    accountMutation.isPending;

    const isLoading =
        categoryQuery.isLoading || accountQuery.isLoading;



    return(
        <Sheet open={true} onOpenChange={onClose}>
            <SheetContent className="space-y-4">
                <SheetHeader className="mb-4">
                    <SheetTitle>
                        New Transaction
                    </SheetTitle>
                    <SheetDescription>
                        Create a new transaction to transaction 
                    </SheetDescription>
                </SheetHeader>
                <TransactionForm 
                    onSubmit={onSubmit}
                    disabled={isPending}
                    accountOptions={accountOptions}
                    categoryOptions={categoryOptions}
                    onCreateAccount={onCreateAccount}
                    onCreateCategory={onCreateCategory}
                />
            </SheetContent>
        </Sheet>
    )
}