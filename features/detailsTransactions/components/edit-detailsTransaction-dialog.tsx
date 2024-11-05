import {z} from "zod"

import { insertdetailsTransactionsSchema } from "@/db/schema"
import { TransactionForm } from "./detailsTransaction-form"

import { Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle 
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEditDetailsTransaction } from "../api/use-edit-detailsTransaction"
import { useDeleteDetailsTransaction } from "../api/use-delete-detailsTransaction"
import { useCreateDetailsTransaction } from "../api/use-create-detailsTransactions"
import {useGetAccounts} from "@/features/accounts/api/use-get-accounts"
import { useCreateAccount } from "@/features/accounts/api/use-create-accounts"
import { useConfirm } from "@/hooks/use-comform"
import { useGetProjects } from "@/features/projects/api/use-get-projects"
import { useGetCategories } from "@/features/categories/api/use-get-categories"
import { useCreateCategory } from "@/features/categories/api/use-create-categories"
import { useGetDetailsTransaction } from "../api/use-get-detailsTransaction"
import { useOpenDetailsTransaction } from "@/features/detailsTransactions/hooks/use-open-details"

const apiSchema = insertdetailsTransactionsSchema.omit({
})
type ApiValues = z.input<typeof apiSchema>


export const EditDetailsTransactionDialog =()=>{
    const[ConfirmDialog,confirm] = useConfirm(
        "Are you sure",
        "You are About to delete this transaction."
    )
    const {isOpen, onClose,id} = useOpenDetailsTransaction()
    console.log(id)
    const transactionQuery = useGetDetailsTransaction(id)
    const editMutation = useEditDetailsTransaction(id)
    const deleteMutation = useDeleteDetailsTransaction(id)


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

    const createMutation = useCreateDetailsTransaction()
    
    const onSubmit = (values:FormValues) =>{
        console.log(values)
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

    
        /* amount: string;
        quantity: string;
        unitPrice: string;
        name?: string | undefined;
        categoryId?: string | null | undefined; */
console.log(transactionQuery)
        const defaultValues = transactionQuery.data ? {
            name:transactionQuery.data.name,
            categoryId: transactionQuery.data.categoryId,
            projectId: transactionQuery.data.categoryId,
            amount: transactionQuery.data.amount.toString(),
            unitPrice: transactionQuery.data.unitPrice.toString(),
            quantity: transactionQuery.data.quantity.toString(),
        } : {
            accountId: "",
            categoryId: "",
            amount: "",
            date: new Date(),
            payee: "",
            notes: "",
        };

        console.log(defaultValues)


    return(
        <>
            <ConfirmDialog />
             <Dialog open={isOpen}  onOpenChange={onClose} >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Edit Detail Transaction
                    </DialogTitle>
                    <DialogDescription>
                        Create a new Detail to transaction
                    </DialogDescription>
                </DialogHeader>
                {isLoading ? (
                   <div className="absolute inset-0 flex items-center justify-content" >
                    <Loader2 className="size-4 text-muted-foreground animate-spin" />
                   </div> 
                ):(<TransactionForm 
                        onSubmit={onSubmit}
                        disabled={isPending}
                        onDelete={onDelete}
                        id={id}
                        defaultValues={defaultValues}
                        projectOptions={projectOptions}
                        categoryOptions={categoryOptions}
                        onCreateCategory={onCreateCategory}
                    />)}
                <DialogFooter>
                    <Button onClick={onClose}>
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
        
    )
}