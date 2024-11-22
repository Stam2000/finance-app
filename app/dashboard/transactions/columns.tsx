import { ColumnDef } from "@tanstack/react-table";
import { InferResponseType } from "hono";
import {client} from "@/lib/hono"
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import {formatCurrency} from "@/lib/utils"
import { Badge } from "@/components/ui/badge";
import {format} from "date-fns"
import { CategoryColumn } from "./category-column";
import { AccountColumn } from "./account-column";
import { Actions } from "./actions";
import { DetailsTable } from "./columnsDetails"


export type ResponseType = InferResponseType<typeof client.api.transactions.$get,200 >["data"][0]
 
export const columns:ColumnDef<ResponseType>[]= [
    {
        id:"select",
        header:({table})=>(
            <Checkbox
                
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value)=>table.toggleAllPageRowsSelected(!!value)}
                ariel-label="Select all"
            />
        ),
        cell:({row})=>(
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={
                    (value)=> row.toggleSelected(!!value)
                }
                ariel-label="Select all"
            />
        ),
        enableHiding:false,
        enableSorting:false,
    },{
        accessorKey:"date",
        header:({column})=>(
            <Button 
             variant="ghost"
             onClick={()=>column.toggleSorting(column.getIsSorted()==="asc")}
            >
                Date
                <ArrowUpDown className="ml-2 h-4 w-4"/>
            </Button>
        ),
        cell:({row})=>{
            const date = row.getValue("date") as Date;
            const detailstransactions = row.getValue("date")
            console.log(detailstransactions)

            return (
                <div className="flex justify-around items-center" >
                    {format(date,("dd MMMM,yyyy"))}
                    <Button
                        variant="ghost"
                        onClick={()=> row.toggleExpanded()}
                        className="text-xs hover:bg-none hover:text-cyan-500 text-cyan-500"
                    >
                        {
                            row.getIsExpanded() ? (<>
                               Close <ChevronUp className="ml-1 size-4" />
                            </>):(<>
                               Details <ChevronDown className="ml-1 size-4"/>
                            </>   
                        )}
                    </Button>
                </div>
            )
        }
    },{
        accessorKey:"category",
        header:({column})=>(
            <Button
             variant="ghost"
             onClick={()=> column.toggleSorting(column.getIsSorted()==="asc")}
            >
                Category
                <ArrowUpDown className="ml-2 h-4 w-4"/>
            </Button>
        ),
         cell:({row})=>{
            return(
                <CategoryColumn 
                    id={row.original.id}
                    category={row.original.category}
                    categoryId={row.original.categoryId}
                />
            );
        }
    },
    {
        accessorKey:"payee",
        header:({column})=>(
            <Button
             variant="ghost"
             onClick={()=> column.toggleSorting(column.getIsSorted()==="asc")}
            >
                Payee
                <ArrowUpDown className="ml-2 h-4 w-4"/>
            </Button>
        )
    }
   ,{
        accessorKey:"amount",
        header:({column})=>(
            <Button
                variant="ghost"
                onClick={()=>column.toggleSorting(column.getIsSorted()==="asc")}
            >
                Amount
                <ArrowUpDown className="ml-2 h-4 w-4"/>
            </Button>
        ),
        cell:({row})=>{
            const amount = parseFloat(row.getValue("amount"))

            return(
               <Badge
                    className="text-xs font-medium px-3.5 py-2.5"
                    variant={amount < 0 ? "destructive":"primary" }
               >
                {formatCurrency(amount)}
               </Badge>
            )
        }
    },{
        accessorKey:"account",
        header:({column})=>{
            return(
                <Button
                    variant="ghost"
                    onClick={()=>column.toggleSorting(column.getIsSorted()==="asc")}
                >
                    Account
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            )
        },
        cell:({row})=>{
                return(<AccountColumn 
                    account={row.original.account}
                    accountId={row.original.accountId}
                />)
        }
    },{
        id:"actions",
        cell:({row})=><Actions id={row.original.id}/>     
    }
];