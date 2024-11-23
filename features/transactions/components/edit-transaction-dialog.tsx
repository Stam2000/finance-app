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
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEditTransaction } from "../api/use-edit-transaction"
import { useDeleteTransaction } from "../api/use-delete-transaction"
import { useOpenTransaction } from "../hooks/use-open-transaction"
import { useCreateTransaction } from "../api/use-create-transactions"
import {useGetAccounts} from "@/features/accounts/api/use-get-accounts"
import { useCreateAccount } from "@/features/accounts/api/use-create-accounts"
import { useConfirm } from "@/hooks/use-comform"
import { useGetCategories } from "@/features/categories/api/use-get-categories"
import { useCreateCategory } from "@/features/categories/api/use-create-categories"
import { useGetTransaction } from "../api/use-get-transaction"
import { useGetProjects } from "@/features/projects/api/use-get-projects"
import { useOpenDetailsTransaction } from "@/features/detailsTransactions/hooks/use-open-details"

const formSchema = insertTransactionSchema.omit({
    id:true,
})

type FormValues = z.input<typeof formSchema>

export const EditTransactionDialog =()=>{
    const[ConfirmDialog,confirm] = useConfirm(
        "Are you sure",
        "You are About to delete this transaction."
    )
    const {isOpen, onClose,id} = useOpenTransaction()

    const transactionQuery = useGetTransaction(id!)
    const editMutation = useEditTransaction(id!)
    const deleteMutation = useDeleteTransaction(id!)
    

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

    const projectQuery = useGetProjects()
    const projectOptions = (projectQuery.data ?? []).map(
        (project)=>({
            label:project.name,
            value:project.id
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
        categoryQuery.isLoading || accountQuery.isLoading || transactionQuery.isLoading

        const defaultValues = transactionQuery.data ? {
            accountId: transactionQuery.data[0].accountId,
            categoryId: transactionQuery.data[0].categoryId,
            projectId: transactionQuery.data[0].projectId,
            amount: transactionQuery.data[0].amount.toString(),
            date: transactionQuery.data[0].date 
            ? new Date(transactionQuery.data[0].date)
            : new Date(),
            payee: transactionQuery.data[0].payee,
            notes: transactionQuery.data[0].notes,
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
             <Dialog open={isOpen} onOpenChange={onClose} >
            <DialogContent className="overflow-y-auto" >
                <DialogHeader>
                    <DialogTitle>
                        Edit Transaction
                    </DialogTitle>
                    {/* <DialogDescription>
                        Edit this transaction
                    </DialogDescription> */}
                </DialogHeader>
                {isLoading ? (
                   <div className="absolute inset-0 flex items-center justify-content" >
                    <Loader2 className="size-4 text-muted-foreground animate-spin" />
                   </div> 
                ):(<TransactionForm 
                        onSubmit={onSubmit}
                        disabled={isPending}
                        onDelete={onDelete}
                        id={id ? id : undefined}
                        defaultValues={defaultValues}
                        projectOptions={projectOptions}
                        accountOptions={accountOptions}
                        categoryOptions={categoryOptions}
                        onCreateAccount={onCreateAccount}
                        onCreateCategory={onCreateCategory}
                    />)}
                <DialogFooter>
                    <Button variant={"destructive"} onClick={onClose}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
        
    )
}