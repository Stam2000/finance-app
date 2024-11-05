import {z} from "zod"
import { Trash } from "lucide-react"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"

import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import { insertCategorySchema } from "@/db/schema"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { AmountInput } from "@/components/account-input"
import { convertAmountToMiliunits } from "@/lib/utils"

const formSchema = z.object({
    name:z.string(),
    goal:z.string().nullable().optional(),
})
const apiSchema = insertCategorySchema.omit({
    id:true,
    plaidId:true,
    userId:true
})

type FormValues = z.input<typeof formSchema>
type ApiValues = z.input<typeof apiSchema>

type Props ={
    id?:string,
    defaultValues?:FormValues,
    onSubmit:(vales:ApiValues)=>void;
    onDelete?:()=>void;
    disabled?:boolean;
};

export const CategoryForm =({
id,
defaultValues,
onSubmit,
onDelete,
disabled
}:Props)=>{

    const form  = useForm<FormValues>({
        resolver:zodResolver(formSchema),
        defaultValues:defaultValues,
    });

    const handleSubmit = (values:FormValues)=>{
        
        const goal = parseFloat(values.goal ? values.goal : "")
        const amountInMiliunits = convertAmountToMiliunits(goal)
        onSubmit({
            ...values,
            goal:amountInMiliunits,
        });
    }

    const handleDelete =()=>{
        onDelete?.()
    }

    return(
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4 pt-4"
            >
            
            <FormField
            name="name"
            control={form.control}
            render={({field})=>(
                <FormItem>
                    <FormLabel>

                    </FormLabel>
                    <FormControl>
                        <Input
                           disabled={disabled}
                            placeholder="e.g Cash, Bank Credit Card"
                            {...field}
                        />
                    </FormControl>
                </FormItem>
            )}
            />
            <FormField
                name="goal"
                control={form.control}
                render={({field})=>(
                    <FormItem>
                        <FormLabel>
                        Monthly limit
                        </FormLabel>
                        <FormControl>
                            <AmountInput 
                                {...field}
                                disabled={disabled}
                                placeholder="0.00"
                            />
                        </FormControl>
                    </FormItem>    
                )}
            />
            <Button
                className="w-full"
                disabled={disabled}
            >
                {id ? "Save changes":"Create account"}
            </Button>
            {!!id && (<Button
                type="button"
                disabled={disabled}
                onClick={handleDelete}
                className="w-full"
                variant="outline"
            >
                <Trash className="size-4 mr-2" />
                Delete
            </Button>)}
            </form>
        </Form>
    )
}