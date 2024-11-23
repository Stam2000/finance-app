"use client"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { DataTable } from "@/components/data-table"
/* import { DataTable } from "./Overviewtable" */

import {detailsColumns} from "./DetailsColumns"
import { useGetDetailsTransactions } from "@/features/detailsTransactions/api/use-get-detailsTransactions"
import { useBulkDeleteDetailsTransactions } from "@/features/detailsTransactions/api/use-bulk-delete-detailsTransactions"
import { Skeleton } from "@/components/ui/skeleton"
import { NewTransactionDialog } from "@/features/transactions/components/new-transaction-dialog"


const Page = ()=>{
    const detailsTransactionQuery = useGetDetailsTransactions()
   
    const detailsTransactions = detailsTransactionQuery.data || []

  
    
    const deleteMutation = useBulkDeleteDetailsTransactions()

    const isDisabled= detailsTransactionQuery.isLoading || deleteMutation.isPending




    if(detailsTransactionQuery.isLoading){
        return(
            <div className=" max-w-screen-2xl mx-auto w-full pb-10">
                <Card className="border-none drop-shadow-sm" >
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-[500px] flex items-center justify-center" >
                            <Loader2 className="size-4 text-slate-300 animate-spin"/>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }


    
    

    return(
        <Card className=" flex-1 mb-10" >
            <NewTransactionDialog />
            <CardHeader>
                <CardTitle>
                   Transactions
                   
                </CardTitle>

            </CardHeader>
            <CardContent>
                <DataTable
                    filterKey="name"
                    columns={detailsColumns}
                    data={detailsTransactions}
                    disabled={isDisabled}
                    onDelete={(rows)=>{
                    const ids = rows.map((row)=> row.original.id)
                    deleteMutation.mutate({ids})
                    }}
                />
            </CardContent>
        </Card>
    )
}

export default Page 