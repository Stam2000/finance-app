"use client"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { DataTable } from "./data-table"
import { Plus } from "lucide-react"
import {columns} from "./columns"
import { Button } from "@/components/ui/button"
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions"
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions"
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction"
import { useState } from "react"
import {transactions as transactionSchema} from "@/db/schema"
import { UploadButton } from "./upload-button"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"
import { useSelectAccount } from "@/features/accounts/hooks/use-select-account"
import { ImportCard } from "./import-card"
import { toast } from "sonner"
import { useBulkCreateTransactionsAndDetails } from "@/features/transactions/api/bulk-upload-Transations-and-Details"
import { useCreateTransaction } from "@/features/transactions/api/use-create-transactions"
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions"
import { NewTransactionDialog } from "@/features/transactions/components/new-transaction-dialog"
/* import { useBulkCreateTAndDfromJson } from "@/lib/AI/bulkCreateTransactions" */
import {json} from "@/lib/AI/bulkCreateTransactions"
import { testData } from "@/lib/transaction"
import axios from "axios"



enum VARIANTS {
    LIST="LIST",
    IMPORT="IMPORT"
}
const INITIAL_IMPORT_RESULTS = {
    data:[],
    error:[],
    meta:{}
}

const Page = ()=>{
    const [AccountDialog,confirm] = useSelectAccount()
    const [variant,setVariant] = useState<VARIANTS>(VARIANTS.LIST)
    const [importResults,setImportResults] = useState(INITIAL_IMPORT_RESULTS)

    const onUpload = (results:typeof INITIAL_IMPORT_RESULTS)=>{
        setImportResults(results)
        setVariant(VARIANTS.IMPORT)
    }

    const onCancelImport = ()=>{
        setImportResults(INITIAL_IMPORT_RESULTS)
        setVariant(VARIANTS.LIST)
    }
   /*  const BTD = useBulkCreateTAndDfromJson() */
    const createTransactionsAndDetails = useBulkCreateTransactionsAndDetails()
    const createTransactions = useBulkCreateTransactions()
    const transactionQuery = useGetTransactions()
    console.log(transactionQuery)
    const transactions = transactionQuery.data || []
    const newTransaction = useNewTransaction()
    console.log(transactions)
    
    const deleteMutation = useBulkDeleteTransactions()

    const isDisabled= transactionQuery.isLoading || deleteMutation.isPending
    const sampleTransactions = [
        {
            accountId: "testData",
            amount: 100.00,
            payee: "John Doe",
            date: "2024-08-30T12:00:00Z",
            notes: "Payment for services",
            categoryId: "xobeuk23eyti2gszf23dyabl", 
            detailsTransactions: {
                amount: 100.00,
                name: "Service Charge",
                categoryId: "xobeuk23eyti2gszf23dyabl", 
                quantity: 1,
                unitPrice: 100.00,
                transactionId: "txn1"
            }
        },
        {
            accountId: "jaw6dbsfqesmm272a1zjd33o",
            amount: 250.00,
            payee: "Jane Smith",
            date: "2024-08-31T09:00:00Z",
            notes: null,
            categoryId: "xobeuk23eyti2gszf23dyabl",
        },
        {
            accountId: "snwtizwnm6hppq0crnom1csy",
            amount: 755.0,
            payee: "Alice Johnson",
            date: "2024-09-01T14:00:00Z",
            notes: "Refund",
            categoryId: "xobeuk23eyti2gszf23dyabl", 
            detailsTransactions: {
                amount: 755.0,
                name: "Refund",
                categoryId: "xobeuk23eyti2gszf23dyabl", 
                quantity: 1,
                unitPrice: 755.0,
                transactionId: "txn2" 
            }
        }
    ]

    const handleBulkImport = ()=>{
        createTransactionsAndDetails.mutate(sampleTransactions,{
            onSuccess(data, variables, context) {
                console.log(data)
            },
        })
    }
    const onSubmitImport = async (
        values: typeof transactionSchema.$inferInsert[],
    ) => {
        const accountId = await confirm();

        if (!accountId) {
            return toast.error("Please select an account to continue.");
        }

        const data = values.map((value) => ({
            ...value,
            accountId: accountId as string,
        }));

        createTransactions.mutate(data, {
            onSuccess: () => {
                onCancelImport();
            },
        });
    };


    const had = async()=>{
        const r = await axios.get("http://localhost:3000/api/conversation")
        console.log(r!)
    }

    if(transactionQuery.isLoading){
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


    if(variant === VARIANTS.IMPORT){
        return(
            <>
                <AccountDialog />
                <ImportCard 
                    data={importResults.data}
                    onCancel={onCancelImport}
                    onSubmit={onSubmitImport}
                />
            </>
        )
    }
    
    const filters = ["payee","category","account"]

    return(
        <Card className=" flex-1 " >
            <NewTransactionDialog />
            <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between" >
                <CardTitle>
                   Transaction History
                </CardTitle>
                <div className="flex flex-col lg:flex-row gap-y-2 items-center gap-x-2">
            <Button 
              onClick={newTransaction.onOpen} 
              size="sm"
              className="w-full lg:w-auto"
            >
              <Plus className="size-4 mr-2" />
              Add new
            </Button>
            <UploadButton onUpload={onUpload} />
          </div>
            </CardHeader>
            <CardContent>
                <DataTable
                    filterKeys={filters}
                    columns={columns}
                    data={transactions}
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