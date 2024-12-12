"use client";

import { useDeleteTransaction } from "@/features/transactions/api/use-delete-transaction";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";
import { useConfirm } from "@/hooks/use-comform";
import { useNewDetails } from "@/features/detailsTransactions/hooks/use-new-details";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Edit, Trash } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  id: string;
};
export const Actions = ({ id }: Props) => {
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this transaction.",
  );

  const deleteMutation = useDeleteTransaction(id);
  const { onOpen } = useOpenTransaction();
  const { onOpen: onOpenDetails } = useNewDetails();

  const handleDelete = async () => {
    const ok = await confirm();

    if (ok) {
      deleteMutation.mutate();
    }
  };

  return (
    <>
      <ConfirmDialog />
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="size-8 p-0">
            <MoreHorizontal className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-1 ">
          <Button
            disabled={deleteMutation.isPending}
            onClick={() => onOpen(id)}
          >
            <Edit className="size-4 mr-2" />
            Edit
          </Button>
          <Button
            disabled={deleteMutation.isPending}
            onClick={() => onOpenDetails(id)}
          >
            <Edit className="size-4 mr-2" />
            Add Items
          </Button>
          <Button disabled={deleteMutation.isPending} onClick={handleDelete}>
            <Trash className="size-4 mr-2" />
            Delete
          </Button>
        </PopoverContent>
      </Popover>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={deleteMutation.isPending}
            onClick={() => onOpen(id)}
          >
            <Edit className="size-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={deleteMutation.isPending}
            onClick={() => onOpenDetails(id)}
          >
            <Edit className="size-4 mr-2" />
            Add Details
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
          >
            <Trash className="size-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
