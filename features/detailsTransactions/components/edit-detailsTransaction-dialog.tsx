import { z } from "zod";

import { insertdetailsTransactionsSchema } from "@/db/schema";
import { TransactionForm } from "./detailsTransaction-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditDetailsTransaction } from "../api/use-edit-detailsTransaction";
import { useDeleteDetailsTransaction } from "../api/use-delete-detailsTransaction";
import { useCreateDetailsTransaction } from "../api/use-create-detailsTransactions";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useCreateAccount } from "@/features/accounts/api/use-create-accounts";
import { useConfirm } from "@/hooks/use-comform";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useCreateCategory } from "@/features/categories/api/use-create-categories";
import { useGetDetailsTransaction } from "../api/use-get-detailsTransaction";
import { useOpenDetailsTransaction } from "@/features/detailsTransactions/hooks/use-open-details";

const apiSchema = insertdetailsTransactionsSchema.omit({});
type ApiValues = z.input<typeof apiSchema>;

export const EditDetailsTransactionDialog = () => {
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure",
    "You are About to delete this transaction.",
  );
  const { isOpen, onClose, id } = useOpenDetailsTransaction();

  const transactionQuery = useGetDetailsTransaction(id!);
  const editMutation = useEditDetailsTransaction(id!);
  const deleteMutation = useDeleteDetailsTransaction(id!);

  const onDelete = async () => {
    const ok = await confirm();
    if (ok) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const accountQuery = useGetAccounts();
  const accountMutation = useCreateAccount();

  const categoryQuery = useGetCategories();
  const categoryMutation = useCreateCategory();
  const categoryOptions = (categoryQuery.data ?? []).map((category) => ({
    label: category.name,
    value: category.id,
  }));

  const projectQuery = useGetProjects();
  const projectOptions = (projectQuery.data ?? []).map((project) => ({
    label: project.name,
    value: project.id,
  }));

  const onCreateCategory = (name: string) =>
    categoryMutation.mutate({
      name,
    });

  const createMutation = useCreateDetailsTransaction();

  const onSubmit = (values: ApiValues) => {
    const updatedValues = {
      ...values,
      transactionId: transactionQuery.data!.transactionId,
    };
    editMutation.mutate(updatedValues, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const isPending =
    createMutation.isPending ||
    categoryMutation.isPending ||
    accountMutation.isPending ||
    editMutation.isPending ||
    deleteMutation.isPending;

  const isLoading =
    categoryQuery.isLoading ||
    accountQuery.isLoading ||
    transactionQuery.isLoading;

  /* amount: string;
        quantity: string;
        unitPrice: string;
        name?: string | undefined;
        categoryId?: string | null | undefined; */

  const defaultValues = transactionQuery.data
    ? {
        name: transactionQuery.data.name || undefined,
        categoryId: transactionQuery.data.categoryId,
        projectId: transactionQuery.data.projectId,
        amount: transactionQuery.data.amount.toString(),
        unitPrice: transactionQuery.data.unitPrice?.toString() || "0",
        quantity: transactionQuery.data.quantity?.toString() || "0",
      }
    : {
        accountId: "",
        categoryId: "",
        amount: "",
        date: new Date(),
        payee: "",
        notes: "",
        unitPrice: "",
        quantity: "",
      };

  return (
    <>
      <ConfirmDialog />
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Add a new Item for this transaction
            </DialogDescription>
          </DialogHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-content">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <TransactionForm
              onSubmit={onSubmit}
              disabled={isPending}
              onDelete={onDelete}
              id={id}
              defaultValues={defaultValues}
              projectOptions={projectOptions}
              categoryOptions={categoryOptions}
              onCreateCategory={onCreateCategory}
            />
          )}
          <DialogFooter>
            <Button onClick={onClose}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
