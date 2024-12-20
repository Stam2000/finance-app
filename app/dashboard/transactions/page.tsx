"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "./data-table";
import { Plus } from "lucide-react";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { useEffect, useState } from "react";
import { transactions as transactionSchema } from "@/db/schema";
import { UploadButton } from "./upload-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { useSelectAccount } from "@/features/accounts/hooks/use-select-account";
import { ImportCard } from "./import-card";
import { toast } from "sonner";
import { useBulkCreateTransactionsAndDetails } from "@/features/transactions/api/bulk-upload-transations-and-details";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";
import { NewTransactionDialog } from "@/features/transactions/components/new-transaction-dialog";
import { RefreshCcw } from "lucide-react";
import { createId } from "@paralleldrive/cuid2";

enum VARIANTS {
  LIST = "LIST",
  IMPORT = "IMPORT",
}
const INITIAL_IMPORT_RESULTS = {
  data: [],
  error: [],
  meta: {},
};

const Page = () => {
  const [AccountDialog, confirm] = useSelectAccount();
  const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
  const [importResults, setImportResults] = useState(INITIAL_IMPORT_RESULTS);
  const [renderKey, setRenderKey] = useState(createId());

  const filters = ["payee", "category", "account"];

  const onUpload = (results: typeof INITIAL_IMPORT_RESULTS) => {
    setImportResults(results);
    setVariant(VARIANTS.IMPORT);
  };

  const rerender = () => {
    setRenderKey(createId());
  };

  const onCancelImport = () => {
    setImportResults(INITIAL_IMPORT_RESULTS);
    setVariant(VARIANTS.LIST);
  };
  /*  const BTD = useBulkCreateTAndDfromJson() */
  const createTransactionsAndDetails = useBulkCreateTransactionsAndDetails();
  const createTransactions = useBulkCreateTransactions();
  const transactionQuery = useGetTransactions();

  const transactions = transactionQuery.data || [];
  const newTransaction = useNewTransaction();

  const deleteMutation = useBulkDeleteTransactions();

  const isDisabled = transactionQuery.isLoading || deleteMutation.isPending;

  const onSubmitImport = async (
    values: (typeof transactionSchema.$inferInsert)[],
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

  if (transactionQuery.isLoading) {
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

  if (variant === VARIANTS.IMPORT) {
    return (
      <>
        <AccountDialog />
        <ImportCard
          data={importResults.data}
          onCancel={onCancelImport}
          onSubmit={onSubmitImport}
        />
      </>
    );
  }

  return (
    <>
      <NewTransactionDialog />
      <Card key={renderKey} className=" flex-1 ">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="flex items-center  gap-2">
            Transaction History
            <Button variant={"outline"} onClick={rerender} className="p-3">
              <RefreshCcw size={16} />
            </Button>
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
