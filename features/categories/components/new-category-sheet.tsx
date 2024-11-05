import {z} from "zod"

import { insertCategorySchema } from "@/db/schema"
import { CategoryForm } from "./category-form"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { useNewCategory } from "../hooks/use-new-category"
import { useCreateCategory } from "../api/use-create-categories"

const formSchema = insertCategorySchema.pick({
    name:true,
})

type FormValues = z.input<typeof formSchema>

export const NewCategorySheet =()=>{
    const {isOpen, onClose} = useNewCategory()

    const mutation = useCreateCategory()
    
    const onSubmit = (values:FormValues) =>{
        mutation.mutate(values,{
            onSuccess:()=>{
                onClose();
            },
        })
    }


    return(
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="space-y-4">
                <SheetHeader className="mb-4">
                    <SheetTitle>
                        New Category
                    </SheetTitle>
                    <SheetDescription>
                        Create a new category to transaction 
                    </SheetDescription>
                </SheetHeader>
                <CategoryForm 
                    onSubmit={onSubmit}
                    disabled={false}
                    defaultValues={{
                        name:"",
                        goal:""
                    }}
                />
            </SheetContent>
        </Sheet>
    )
}