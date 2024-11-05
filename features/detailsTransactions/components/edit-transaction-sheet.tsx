import {z} from "zod"

import { insertTransactionSchema } from "@/db/schema"
import { TransactionForm } from "./detailsTransaction-form"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { useEditTransaction } from "../api/use-edit-detailsTransaction"
import { useDeleteTransaction } from "../api/use-delete-detailsTransaction"
import { useOpenTransaction } from "../hooks/use-open-details"
import { useCreateTransaction } from "../api/use-create-detailsTransactions"
import {useGetAccounts} from "@/features/accounts/api/use-get-accounts"
import { useCreateAccount } from "@/features/accounts/api/use-create-accounts"
import { useConfirm } from "@/hooks/use-comform"
import { useGetCategories } from "@/features/categories/api/use-get-categories"
import { useCreateCategory } from "@/features/categories/api/use-create-categories"
import { useGetTransaction } from "../api/use-get-detailsTransaction"

const formSchema = insertTransactionSchema.omit({
    id:true,
})

type FormValues = z.input<typeof formSchema>

export const EditTransactionSheet =()=>{
    const[ConfirmDialog,confirm] = useConfirm(
        "Are you sure",
        "You are About to delete this transaction."
    )
    const {isOpen, onClose,id} = useOpenTransaction()

    const transactionQuery = useGetTransaction(id)
    const editMutation = useEditTransaction(id)
    const deleteMutation = useDeleteTransaction(id)


    const onDelete = async ()=>{
        const ok = await confirm()
         if(ok){
            deleteMutation.mutate(undefined,{
                onSuccess:()=>{
                    onClose()
                }
            })
         }
    }

    

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
        editMutation.mutate(values,{
            onSuccess:()=>{
                onClose();
            },
        })
    }

    const isPending = 
    createMutation.isPending ||
    categoryMutation.isPending ||
    accountMutation.isPending ||
    editMutation.isPending ||
    deleteMutation.isPending;

    const isLoading =
        categoryQuery.isLoading || accountQuery.isLoading;

    
        const defaultValues = transactionQuery.data ? {
            accountId: transactionQuery.data.accountId,
            categoryId: transactionQuery.data.categoryId,
            amount: transactionQuery.data.amount.toString(),
            date: transactionQuery.data.date 
            ? new Date(transactionQuery.data.date)
            : new Date(),
            payee: transactionQuery.data.payee,
            notes: transactionQuery.data.notes,
        } : {
            accountId: "",
            categoryId: "",
            amount: "",
            date: new Date(),
            payee: "",
            notes: "",
        };


    return(
        <>
            <ConfirmDialog />
            <Sheet open={isOpen} onOpenChange={onClose}>
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
                        onDelete={onDelete}
                        accountOptions={accountOptions}
                        categoryOptions={categoryOptions}
                        onCreateAccount={onCreateAccount}
                        onCreateCategory={onCreateCategory}
                    />
                </SheetContent>
            </Sheet>
        </>
        
    )
}