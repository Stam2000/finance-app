"use client"

import { InferResponseType } from "hono"
import { Goal,Rocket,Wallet,AudioLines } from "lucide-react"
import {client} from "@/lib/hono"
import { ColumnDef } from "@tanstack/react-table"
import { useDeleteProject } from "@/features/projects/api/use-delete-project"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {Action} from "./action"
import { useState } from 'react'
import { convertAmountFromMiliunits } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle,CardDescription } from "@/components/ui/card"
import { useGetProjects } from '@/features/projects/api/use-get-projects'
import { Progress } from "@/components/ui/progress"
import { DataTable as GlobalDataTable} from '@/components/data-table'
import { useBulkDeleteTransactions } from '@/features/transactions/api/use-bulk-delete-transactions'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp, DollarSign, Calendar, FileText } from 'lucide-react'
import { DataTable } from '@/app/dashboard/transactions/data-table'
import { detailsColumns } from '@/app/dashboard/details/DetailsColumns'
import { columns } from "../transactions/columns"
import { useBulkDeleteDetailsTransactions } from "@/features/detailsTransactions/api/use-bulk-delete-detailsTransactions"
import { formatCurrency } from "@/lib/utils"
import { motion,AnimatePresence } from "framer-motion"
import CellComponent from "./cellComponents"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type ResponseType = InferResponseType<typeof client.api.projects.$get,200>["data"][0]

export const ReturnColumns= ()=>{
  
  const filters = ["payee","category","account"]



return  [
  {
    id: "select",
    accessorKey: "name",
    header: ({ column,table }:{column:any,table:any}) => {
      return (
        <div>
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
        
        </div>
      )
    },cell:({row}:{row:any})=> <CellComponent row={row} filters={filters} />,
  enableSorting: true,
  enableHiding: true,
}
]
}


