"use client"
import { InferResponseType } from "hono"
import {client} from "@/lib/hono"
import { Button } from "@/components/ui/button"
import { ArrowUpDown} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import CellComponent from "./cellComponents"

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


