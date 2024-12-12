"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { createId } from "@paralleldrive/cuid2";
import { RefreshCcw } from "lucide-react";
import { detailsColumns } from "./details-columns";
import { useGetDetailsTransactions } from "@/features/detailsTransactions/api/use-get-detailsTransactions";
import { useBulkDeleteDetailsTransactions } from "@/features/detailsTransactions/api/use-bulk-delete-detailsTransactions";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { NewTransactionDialog } from "@/features/transactions/components/new-transaction-dialog";

const Page = () => {
  const detailsTransactionQuery = useGetDetailsTransactions();
  const detailsTransactions = detailsTransactionQuery.data || [];
  const deleteMutation = useBulkDeleteDetailsTransactions();
  const isDisabled =
    detailsTransactionQuery.isLoading || deleteMutation.isPending;
  const [renderKey, setRenderKey] = useState(createId());
  const rerender = () => {
    setRenderKey(createId());
  };

  if (detailsTransactionQuery.isLoading) {
    return (
      <div className=" max-w-screen-2xl mx-auto w-full pb-10">
        <Card className="border-none drop-shadow-sm">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="h-[500px] flex items-center justify-center">
              <Loader2 className="size-4 text-slate-300 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <NewTransactionDialog />
      <Card key={renderKey} className=" flex-1 mb-10">
        <CardHeader>
          <CardTitle className="line-clamp-1 flex items-center gap-2">
            items
            <Button variant={"outline"} onClick={rerender} className="p-3">
              <RefreshCcw size={16} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            filterKey="name"
            columns={detailsColumns}
            data={detailsTransactions}
            disabled={isDisabled}
            onDelete={(rows) => {
              const ids = rows.map((row) => row.original.id);
              deleteMutation.mutate({ ids });
            }}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
