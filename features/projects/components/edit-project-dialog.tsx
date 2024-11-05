import {z} from "zod"

import { insertTransactionSchema } from "@/db/schema"
import { ProjectForm } from "./project-form"

import { Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle 
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

import { useEditProject } from "../api/use-edit-project"
import { useDeleteProject } from "../api/use-delete-project"
import { useOpenProject } from "../hooks/use-open-project"
import { useConfirm } from "@/hooks/use-comform"
import { useGetProject} from "@/features/projects/api/use-get-project"

const formSchema = z.object({
    name:z.string(),
    description:z.string().nullable().optional(),
    budget:z.number(),
})

type FormValues = z.input<typeof formSchema>

export const EditProjectDialog =()=>{
    const[ConfirmDialog,confirm] = useConfirm(
        "Are you sure",
        "You are About to delete this transaction."
    )
    const {isOpen, onClose,id} = useOpenProject()

    const projectQuery = useGetProject(id)
    const editMutation = useEditProject(id)
    const deleteMutation = useDeleteProject(id)
    

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

    
    const onSubmit = (values:FormValues) =>{
        editMutation.mutate(values,{
            onSuccess:()=>{
                onClose();
            },
        })
    }

    const isPending = 
    deleteMutation.isPending;

    const isLoading =
        projectQuery.isLoading

    console.log(projectQuery.data)
        const defaultValues = projectQuery.data ? {
            name: projectQuery.data.name,
            description: projectQuery.data.description,
            budget: projectQuery.data.budget.toString(),
            endDate:projectQuery.data.endDate,
            startDate:projectQuery.data.startDate
        } : {
            name: "",
            description:"",
            budget:"",
        };

        console.log(defaultValues)


    return(
        <>
            <ConfirmDialog />
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
                {isLoading ? (
                   <div className="absolute inset-0 flex items-center justify-content" >
                    <Loader2 className="size-4 text-muted-foreground animate-spin" />
                   </div> 
                ):(<ProjectForm 
                        onSubmit={onSubmit}
                        disabled={isPending}
                        onDelete={onDelete}
                        defaultValues={defaultValues}
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