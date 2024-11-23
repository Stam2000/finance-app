import {z} from "zod"

import { ProjectForm } from "./project-form"
import { Dialog,
        DialogContent,
        DialogDescription,
        DialogFooter,
        DialogHeader,
        DialogTitle 
    } from "@/components/ui/dialog"
import { useNewProject } from "../hooks/use-new-project"
import { useCreateProject } from "../api/use-create-project"
import { Button } from "@/components/ui/button"
import { useCreateCategory } from "@/features/categories/api/use-create-categories"

const formSchema = z.object({
    name:z.string(),
    description:z.string().nullable().optional(),
    budget:z.number(),
})

type FormValues = z.input<typeof formSchema>

export const NewProjectDialog =()=>{
    const {isOpen,onClose} = useNewProject()
    const createMutation = useCreateProject()

    const onSubmit = (values:any)=>{
        createMutation.mutate(values,{
            onSuccess:()=>{
                onClose()
            }
        })
    }

    

    const isPending = 
    createMutation.isPending

    return(
        <Dialog open={isOpen}  onOpenChange={onClose} >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        New Project
                    </DialogTitle>
                    <DialogDescription>
                        Create a new Project
                    </DialogDescription>
                </DialogHeader>
                    <ProjectForm 
                        onSubmit={onSubmit}
                        disabled={isPending}
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