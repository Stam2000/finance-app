import { z } from "zod";

import { insertAccountSchema } from "@/db/schema";
import { AccountForm } from "./account-form";
import { useConfirm } from "@/hooks/use-comform";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useOpenAccount } from "../hooks/use-open-account";
import { useEditAccount } from "../api/use-edit-account";
import { useGetAccount } from "../api/use-get-account";
import { useDeleteAccount } from "../api/use-delete-account";
import { Loader2 } from "lucide-react";

const formSchema = insertAccountSchema.pick({
  name: true,
});

type FormValues = z.input<typeof formSchema>;

export const EditAccountSheet = () => {
  const { isOpen, onClose, id } = useOpenAccount();
  const query = useGetAccount(id);
  const editmutation = useEditAccount(id);
  const deletemutation = useDeleteAccount(id);

  const isLoading = query.isLoading;
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure",
    "You are about to delete this account.",
  );

  const defaultValues = query.data
    ? {
        name: query.data.name,
      }
    : { name: "" };

  const isPending = editmutation.isPending || deletemutation.isPending;

  const onSubmit = (values: FormValues) => {
    editmutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const onDelete = async () => {
    deletemutation.mutate(undefined, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader className="mb-4">
            <SheetTitle>Edit Account</SheetTitle>
            <SheetDescription>Edit an existing account</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex item-center justify-content">
              <Loader2 className="size-4 animate-spin text-muted-foreground absolute" />
            </div>
          ) : (
            <AccountForm
              id={id}
              onSubmit={onSubmit}
              disabled={isPending}
              defaultValues={defaultValues}
              onDelete={onDelete}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
