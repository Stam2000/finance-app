"use client";

import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Edit } from "lucide-react";
import { useState } from "react";
import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";
import { useConfirm } from "@/hooks/use-comform";
import { useDeleteAccount } from "@/features/accounts/api/use-delete-account";
import { Trash } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  id: string;
};

export const Action = ({ id }: Props) => {
  const { onOpen } = useOpenAccount();
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure",
    "You are about to delete this account.",
  );
  const deleteMutation = useDeleteAccount(id);
  const [active, setActive] = useState(false);

  const onDelete = async () => {
    const ok = await confirm();
    if (ok) {
      deleteMutation.mutate();
    }
  };

  return (
    <>
      <ConfirmDialog />
      <Popover onOpenChange={(open) => setActive(open)}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={`size-8 p-0 ${active ? "bg-slate-900 text-white" : null}`}
          >
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
          <Button disabled={deleteMutation.isPending} onClick={onDelete}>
            <Trash className="size-4 mr-2" />
            Delete
          </Button>
        </PopoverContent>
      </Popover>
    </>
  );
};
