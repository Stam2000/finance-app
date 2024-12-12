"use client";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Action } from "./action";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { convertAmountFromMiliunits } from "@/lib/utils";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type ResponseType = InferResponseType<
  typeof client.api.accounts.$get,
  200
>["data"][0];

export const columns: ColumnDef<ResponseType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="flex gap-2"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <div className="flex flex-col">
          <span>Spent/Earned</span>
          <span>(monthly)</span>
        </div>

        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(
        row.getValue("amount") ? row.getValue("amount") : "0",
      );

      return (
        <Badge
          className="text-xs font-medium px-3.5 py-2.5"
          variant={amount < 0 ? "destructive" : "primary"}
        >
          {formatCurrency(convertAmountFromMiliunits(amount))}
        </Badge>
      );
    },
  },
  {
    accessorKey: "goal",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Monthly Limit
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(
        row.getValue("goal") ? row.getValue("goal") : "0",
      );

      return (
        <Badge
          className="text-xs font-medium px-3.5 py-2.5"
          variant={amount < 0 ? "destructive" : "primary"}
        >
          {formatCurrency(convertAmountFromMiliunits(amount))}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <Action id={row.original.id} />,
  },
];
