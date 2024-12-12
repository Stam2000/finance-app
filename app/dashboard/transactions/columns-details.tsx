"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

import { ActionsDetails } from "./actions-details";
import React from "react";

export type ResponseType = InferResponseType<
  typeof client.api.detailsTransactions.$get,
  200
>["data"][0];
type trResponseType = InferResponseType<
  typeof client.api.transactions.$get,
  200
>["data"][0];

export const DetailsTable: React.FC<{
  detailsTransactions: ResponseType[];
}> = ({ detailsTransactions }) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [rowSelection, setRowSelection] = React.useState({});
  const [expanded, setExpanded] = React.useState({});

  const detailsColumns: ColumnDef<ResponseType>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          ariel-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select all"
        />
      ),
      enableHiding: false,
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const name: string | null = row.getValue("name");

        return <span>{name}</span>;
      },
    },
    {
      accessorKey: "unitPrice",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          UnitPrice
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const unitPrice: number = row.getValue("unitPrice");
        return (
          <Badge
            className="text-xs font-medium px-3.5 py-2.5"
            variant={unitPrice < 0 ? "destructive" : "primary"}
          >
            {formatCurrency(unitPrice || 0)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const quantity: number | null = row.getValue("quantity");
        return (
          <div className="flex items-center cursor-pointer hover:underline">
            {quantity}
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount: number = row.getValue("amount");

        return (
          <Badge
            className="text-xs font-medium px-3.5 py-2.5"
            variant={amount < 0 ? "destructive" : "primary"}
          >
            {formatCurrency(amount)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ActionsDetails
          id={{
            detailsId: row.original.id,
            transactionId: row.original.transactionId,
          }}
        />
      ),
    },
  ];

  const table = useReactTable({
    data: detailsTransactions,
    columns: detailsColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      expanded,
    },
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={detailsColumns.length}
              className="h-24 text-center"
            >
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
