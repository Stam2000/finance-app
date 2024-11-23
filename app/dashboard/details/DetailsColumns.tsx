"use client"

import {
    ColumnDef,   
  } from "@tanstack/react-table"
import { InferResponseType } from "hono";
import {client} from "@/lib/hono"
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import {formatCurrency} from "@/lib/utils"
import { Badge } from "@/components/ui/badge";
import { ActionsDetails } from "./actionsDetails";
import React from "react"
import {format} from "date-fns"
import { DetailsTransactionsType } from "@/db/schema";



export type ResponseType = InferResponseType<typeof client.api.detailsTransactions.$get,200 >["data"][0]


export  const detailsColumns:ColumnDef<DetailsTransactionsType>[]= [
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
                    aria-label="Select all"
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
    
                return (
                    <div className="flex justify-around items-center" >
                        {format(date,("dd MMMM,yyyy"))}
                    </div>
                )
            }
        },{
            accessorKey:"name",
            header:({column})=>(
                <Button 
                 variant="ghost"
                 onClick={()=>column.toggleSorting(column.getIsSorted()==="asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            ),
            cell:({row})=>{
                const name:string|null = row.getValue("name");
    
                return (
                    <span>
                        {name}
                    </span>
                )
            }
        },{
            accessorKey:"unitPrice",
            header:({column})=>(
                <Button
                 variant="ghost"
                 onClick={()=> column.toggleSorting(column.getIsSorted()==="asc")}
                >
                    UnitPrice
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            ),
            cell:({row})=>{
    
                const unitPrice:number = row.getValue("unitPrice")
                return(
                  <Badge
                  className="text-xs font-medium px-3.5 py-2.5"
                  variant={unitPrice < 0 ? "destructive":"primary" }
             >
              {formatCurrency(unitPrice)}
             </Badge>
                );
            }
        },
        {
            accessorKey:"quantity",
            header:({column})=>(
                <Button
                 variant="ghost"
                 onClick={()=> column.toggleSorting(column.getIsSorted()==="asc")}
                >
                    Quantity
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            ),cell:({row})=>{
    
                const quantity:number|null = row.getValue("quantity")
                return(
                    <div
                    className="flex items-center cursor-pointer hover:underline"
                >
                    {quantity}
                </div>
                );
        }
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
            id:"actions",
            cell:({row})=><ActionsDetails id={row.original.id} transactionId={row.original.transactionId} />     
        }
    ];

   