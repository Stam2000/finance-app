"use client"

import {useNewAccount } from "@/features/accounts/hooks/use-new-account"
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from "@/components/ui/card"
import { Plus,Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import { useDeleteAccounts } from "@/features/accounts/api/use-delete-accounts";




const AccountsPage = ()=>{
    
    const newAccount = useNewAccount()
    const accountsQuery = useGetAccounts()
    const deleteAccounts = useDeleteAccounts()
   const accounts =accountsQuery.data || []

   if(accountsQuery.isLoading){
    return(
        <div className=" mx-auto w-full -mt-24 " >
            <Card className="border-none drop-shadow-sm" >
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="h-[500px] w-full flex items-center justify-center">
                        <Loader2 className="size-6 text-slate-300 animate-spin"/>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
   }
    return(
        <div className=" flex-1 mx-auto w-full mb-10" >
            <Card className="border-none drop-shadow-sm" >
                <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between" >
                    <CardTitle className="text-xl line-clamp-1" >
                        Accounts
                    </CardTitle>
                    <Button onClick={newAccount.onOpen} size="sm">
                        <Plus className="size-4 mr-2"  />
                        Add New
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable filterKey="name" columns={columns} 
                    onDelete={(row)=>{
                        const ids = row.map((r)=> r.original.id);
                        deleteAccounts.mutate({ids});
                    }}
                    data={accounts}/>
                </CardContent>
            </Card>
        </div>
    )
}

export default AccountsPage;