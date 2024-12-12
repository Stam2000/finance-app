"use client";

import * as React from "react";
import { Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DetailsTable } from "./columns-details";
import { SelectFilterKey } from "./select-filter";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterKeys: string[];
  onDelete: (rows: Row<TData>[]) => void;
  disabled?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterKeys,
  onDelete,
  disabled,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [filterKey, setFilterKey] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [rowSelection, setRowSelection] = React.useState({});
  const [expanded, setExpanded] = React.useState({});
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(
    new Set(),
  );

  const toggleRowExpanded = (rowId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }

      return newSet;
    });
  };

  const table = useReactTable({
    data,
    columns,
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
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder={`Filter ${filterKey}`}
          value={(table.getColumn(filterKey)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(filterKey)?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <SelectFilterKey
          filterkey={filterKey}
          filterKeys={filterKeys}
          onChange={(value) => {
            setFilterKey(value);
          }}
        />
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <Button
            disabled={disabled}
            size="sm"
            variant="outline"
            className="ml-auto font-normal text-xs"
            onClick={() => {
              onDelete(table.getFilteredSelectedRowModel().rows);
              setRowSelection({});
            }}
          >
            <Trash className="size-4 mr-2" />
            Delete ({table.getFilteredSelectedRowModel().rows.length})
          </Button>
        )}
      </div>
      <div className="rounded-md border">
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
              table.getRowModel().rows.map((row: any) => {
                return (
                  <React.Fragment key={row.id}>
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell: any) => {
                        return (
                          <TableCell onClick={() => {}} key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    <AnimatePresence>
                      {row.getIsExpanded() && (
                        <TableCell
                          className="bg-slate-50"
                          colSpan={columns.length}
                        >
                          <motion.div
                            key={`detailsTransactions-${row.id}`}
                            initial="collapsed"
                            animate="open"
                            variants={{
                              open: { height: "auto", opacity: 1 },
                              collapsed: { height: 0, opacity: 0 },
                            }}
                            transition={{
                              duration: 0.1,
                              ease: [0.04, 0.62, 0.23, 0.98],
                            }}
                            className="max-w-full overflow-hidden"
                          >
                            <DetailsTable
                              detailsTransactions={
                                row.original.detailsTransactions
                              }
                            />
                          </motion.div>
                        </TableCell>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {""}
          {table.getFilteredRowModel().rows.length} rows(s) selected.
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
0;
