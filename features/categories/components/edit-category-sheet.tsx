import { z } from "zod";

import { insertCategorySchema } from "@/db/schema";
import { CategoryForm } from "./category-form";
import { useConfirm } from "@/hooks/use-comform";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useOpenCategory } from "../hooks/use-open-category";
import { useEditCategory } from "../api/use-edit-category";
import { useGetCategory } from "../api/use-get-category";
import { useDeleteCategory } from "../api/use-delete-category";
import { Loader2 } from "lucide-react";

const formSchema = insertCategorySchema.pick({
  name: true,
});

type FormValues = z.input<typeof formSchema>;

export const EditCategorySheet = () => {
  const { isOpen, onClose, id } = useOpenCategory();
  const query = useGetCategory(id);
  const editmutation = useEditCategory(id);
  const deletemutation = useDeleteCategory(id);

  const isLoading = query.isLoading;
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure",
    "You are about to delete this category.",
  );

  const defaultValues = query.data
    ? {
        name: query.data.name,
        goal: query.data.goal?.toString(),
      }
    : { name: "", goal: null };

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
            <SheetTitle>Edit Category</SheetTitle>
            <SheetDescription>Edit an existing category</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex item-center justify-content">
              <Loader2 className="size-4 animate-spin text-muted-foreground absolute" />
            </div>
          ) : (
            <CategoryForm
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
