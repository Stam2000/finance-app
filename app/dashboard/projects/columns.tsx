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
    },cell:({row}:{row:any})=>
        {
          const [showTransactions, setShowTransactions] = useState(false)
          const [showDetailsTransactions, setShowDetailsTransactions] = useState(false)
          const percentageSpent = (Math.abs(row.original?.spent) / Math.abs(row.original?.budget)) * 100


          return (
            <div className="mr-4" >
              <div className="px-2 flex justify-between items-center">
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(!!value)}
                  aria-label="Select row"
                />
                <Action  id={row.original.id} />
              </div>
            <Card  className="w-full flex-1 border-none shadow-xs p-10">
            <CardHeader className=" flex items-center md:items-start justify-center px-0">
              <CardTitle className="text-3xl font-bold underline decoration-4  decoration-sky-500 flex items-center gap-1 bg-gradient-to-r from-slate-900 from-50% to-blue-950 to-10% text-transparent bg-clip-text ">  <AudioLines className="size-3 text-slate-500" /> {row.original?.name}</CardTitle>
              <CardDescription className="text-sm font-semibold text-slate-700 mb-2" >Budget Overview</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div>
                <div className="mb-4">
                <div className="flex flex-col lg:flex-row mb-8 gap-4">
                  <div className="hover:bg-slate-100 rounded-sm shadow-sm flex-1 flex  bg-slate-50 flex-col  items-center justify-center gap-1 p-4">
                    <h4 className="text-sm font-medium  text-gray-600 mb-1">Remaining</h4>
                    <div className="text-xl gap-1 flex items-center justify-center font-light">
                      <Wallet className="size-4 text-green-500"/>
                      <span className="font-extrabold underline decoration-green-500 " >{formatCurrency(convertAmountFromMiliunits(row.original?.budget + row.original?.spent))}</span>
                    </div>
                  </div>
                  <div className=" flex-1 hover:bg-slate-100 rounded-sm shadow-sm flex flex-col bg-slate-50 items-center justify-center gap-1 p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Spent</h4>
                    <div className="text-xl flex gap-1 items-center justify-center font-light">
                    <Rocket className="size-4 text-red-500" />
                    <span className="font-extrabold underline decoration-red-500 ">{formatCurrency(convertAmountFromMiliunits(row.original?.spent))}</span>
                    </div>
                  </div>
                  <div className=" flex hover:bg-slate-100 rounded-sm shadow-sm flex-1 flex-col bg-slate-50 items-center justify-center gap-1 p-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Budget</h4>
                    <div className="text-xl gap-1 flex items-center justify-center font-light">
                    <Goal className="size-4 text-yellow-500"/>
                    <span className="font-extrabold text-slate-900 underline decoration-yellow-500">{formatCurrency(convertAmountFromMiliunits(row.original?.budget))}</span>
                    </div>
                  </div>
                </div>
                  <div className="relative  bg-slate-200 h-1 mb-2 rounded-2xl">
                      <motion.div className="absolute bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% h-1 text-sm rounded-2xl max-w-full top-0 right-0 bottom-0 left-0"
                          initial={{width:"0%"}}
                          animate={{width:`${percentageSpent.toFixed(2)}%`}}
                          transition={{duration:1 ,ease:"easeOut"}}
                      >
                        <span className="absolute drop-shadow-lg inset-0 font-bold text-slate-950 flex items-center justify-center" >
                          {percentageSpent.toFixed(2)}%
                        </span>  
                      </motion.div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 mt-1"><span className="text-blue-900 text-sm font-semibold " >{percentageSpent.toFixed(2)}%</span> of budget utilized</p>
                </div>

                <div className="flex flex-col lg:flex-row justify-between  gap-2 m-2">
                  <Button
                    onClick={() => {
                     
                      if(showDetailsTransactions)setShowDetailsTransactions(!showDetailsTransactions)
                      setShowTransactions(!showTransactions)}}
                    variant="outline"
                    className={`w-full ${showTransactions ? "bg-white text-slate-950 border-2 border-slate-950": "bg-slate-950 text-white" } hover:bg-gray-50`}
                  >
                    {showTransactions ? 'Hide Transactions' : 'Show Transactions'}
                    {showTransactions ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={() =>{
                     
                      setShowDetailsTransactions(!showDetailsTransactions)
                      if(showTransactions)setShowTransactions(!showTransactions)}}
                    variant="outline"
                    className={`w-full ${showDetailsTransactions ? "bg-white text-slate-950 border-2 border-slate-950": "bg-slate-950 text-white" } hover:bg-gray-50`}
                  >
                    {showDetailsTransactions ? 'Hide Details Transactions' : 'Show Details Transactions'}
                    {showDetailsTransactions ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
                  <AnimatePresence>
                  {showTransactions && row.original?.transactions && (
                    <motion.div 
                        key={`detailsTransactions-${row.id}`}
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                          open: { height: "auto", opacity: 1 },
                          collapsed: { height: 0, opacity: 0 },
                        }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="max-w-full overflow-hidden">
                      <DataTable
                        filterKeys={filters}
                        columns={columns}
                        data={row.original?.transactions}
                        onDelete={(rows)=>{
                          const ids = rows.map((row)=> row.original.id)
                          }}
                      />
                    </motion.div>
                  )}
                  </AnimatePresence>

                  <AnimatePresence>
                  {showDetailsTransactions && row.original?.detailsTransactions && (
                  
                      <motion.div
                        key={`detailsTransactions-${row.id}`}
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                          open: { height: "auto", opacity: 1 },
                          collapsed: { height: 0, opacity: 0 },
                        }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="max-w-full overflow-hidden"
                      >
                        <GlobalDataTable
                          filterKey="name"
                          columns={detailsColumns}
                          data={row.original?.detailsTransactions}
                          onDelete={(rows) => {
                            const ids = rows.map((row) => row.original.id);
                          }}
                        />
                      </motion.div>
                  
                  )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card></div>
          );
        
  },
  enableSorting: true,
  enableHiding: true,
}
]
}


