import {z} from "zod"
import { Trash } from "lucide-react"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import { Textarea } from "@/components/ui/textarea"
import { convertAmountToMiliunits } from "@/lib/utils"
import { DatePicker } from "@/components/date-picker"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {parse,subDays} from "date-fns"
import { insertProjectSchema } from "@/db/schema"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { AmountInput } from "@/components/account-input"

const formSchema = z.object({
    name:z.string(),
    description:z.string().nullable().optional(),
    budget:z.string(),
    startDate:z.coerce.date(),
    endDate:z.coerce.date(),
})

const apiSchema = insertProjectSchema.omit({
    id:true,
    userId:true
})

type ApiValues = z.infer<typeof apiSchema>
type FormValues = z.input<typeof formSchema>

type Props ={
    id?:string,
    defaultValues?:FormValues,
    onSubmit:(values:{
        name: string;
        budget: number;
        startDate: Date;
        endDate: Date;
        description?: string | null | undefined;
    })=>void;
    onDelete?:()=>void;
    disabled?:boolean;
};


export const ProjectForm =({
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

        const amount = parseFloat(values.budget)
        const amountInMiliunits = convertAmountToMiliunits(amount)
        onSubmit({
            ...values, 
            budget:amountInMiliunits,
        })
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
                        Name
                    </FormLabel>
                    <FormControl>
                        <Input
                           disabled={disabled}
                            placeholder="e.g Name"
                            {...field}
                        />
                    </FormControl>
                </FormItem>
            )}
            />
            <FormField
            name="startDate"
            control={form.control}
            render={({field})=>(
                <FormItem>
                    <div className="flex gap-2 flex-col">
                        <FormLabel>
                            Start Date
                        </FormLabel>
                    <FormControl>
                       <DatePicker 
                        value={field.value}
                        onChange={(date) => field.onChange(date)}
                        disabled={disabled}
                       />
                    </FormControl>
                    </div>
                </FormItem>
            )}
            />
            <FormField
            name="endDate"
            control={form.control}
            render={({field})=>(
                <FormItem>
                    <div className="flex gap-2 flex-col" >
                       <FormLabel>
                            End Date
                        </FormLabel>
                    <FormControl>
                       <DatePicker 
                        value={field.value}
                        onChange={(date) =>{ 
                            return field.onChange(date)}}
                        disabled={disabled}
                       />
                    </FormControl> 
                    </div>
                          
                </FormItem>
            )}
            />
            <FormField
                name="description"
                control={form.control}
                render={({field})=>(
                    <FormItem>
                        <FormLabel>
                            Description
                        </FormLabel>
                        <FormControl>
                            <Textarea 
                                placeholder="Optional notes"
                                disabled={disabled}
                                {...field}
                                value={ field.value ?? ""}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                name="budget"
                control={form.control}
                render={({field})=>(
                    <FormItem>
                        <FormLabel>
                            Budget
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
                {defaultValues ? "Save changes":"Create Project"}
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