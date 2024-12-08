"use client"

import { ColumnDef } from "@tanstack/react-table";
import { InferResponseType } from "hono";
import {client} from "@/lib/hono"
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import {formatCurrency} from "@/lib/utils"
import { Badge } from "@/components/ui/badge";
import {format} from "date-fns"
import {Action} from "./action"

import { MoveRight } from "lucide-react";
import Link from "next/link";

export type ResponseType = InferResponseType<typeof client.api.projects.$get,200>["data"][0]

 
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
    },
    {
        accessorKey:"name",
        header:({column})=>(
            <Button
             variant="ghost"
             onClick={()=> column.toggleSorting(column.getIsSorted()==="asc")}
            >
                name
                <ArrowUpDown className="ml-2 h-4 w-4"/>
            </Button>
        )
    }
   ,{
        accessorKey:"budget",
        header:({column})=>(
            <Button
                variant="ghost"
                onClick={()=>column.toggleSorting(column.getIsSorted()==="asc")}
            >
                budget
                <ArrowUpDown className="ml-2 h-4 w-4"/>
            </Button>
        ),
        cell:({row})=>{
            const budget = parseFloat(row.getValue("budget"))

            return(
               <Badge
                    className="text-xs font-medium px-3.5 py-2.5"
                    variant={budget < 0 ? "destructive":"primary" }
               >
                {formatCurrency(budget)}
               </Badge>
            )
        }
    },{
        accessorKey:"startDate",
        header:({column})=>(
            <Button 
             variant="ghost"
             onClick={()=>column.toggleSorting(column.getIsSorted()==="asc")}
            >
                Start Date
                <ArrowUpDown className="ml-2 h-4 w-4"/>
            </Button>
        ),
        cell:({row})=>{
            const date = row.getValue("startDate") as Date;
           
            return (
                <div>
                    {format(date,("dd MMMM,yyyy"))}
                </div>
            )
        }
    },{
        accessorKey:"endDate",
        header:({column})=>(
            <Button 
             variant="ghost"
             onClick={()=>column.toggleSorting(column.getIsSorted()==="asc")}
            >
                End Date
                <ArrowUpDown className="ml-2 h-4 w-4"/>
            </Button>
        ),
        cell:({row})=>{
            const date = row.getValue("endDate") as Date;
            
            
            return (
                <div>
                    {format(date,("dd MMMM,yyyy"))}
                </div>
            )
        }
    },{
        accessorKey:"spent",
        header:({column})=>(
            <Button
                variant="ghost"
                onClick={()=>column.toggleSorting(column.getIsSorted()==="asc")}
            >
                Spent
                <ArrowUpDown className="ml-2 h-4 w-4"/>
            </Button>
        ),
        cell:({row})=>{
            const spent = parseFloat(row.getValue("spent"))

            return(
               <Badge
                    className="text-xs font-medium px-3.5 py-2.5"
                    variant={spent < 0 ? "destructive":"primary" }
               >
                {formatCurrency(spent)}
               </Badge>
            )
        }
    },
    {
        id:"actions",
        cell:({row})=>(<Button variant={"outline"} >
            <Link className="flex items-center gap-2" href={`/dashboard/projects/${row.original.id}`} >
                Show More 
            <MoveRight size="12" />
            </Link>
            
        </Button>)     
    }
    ,{
        id:"actions",
        cell:({row})=><Action id={row.original.id}/>     
    }
];
