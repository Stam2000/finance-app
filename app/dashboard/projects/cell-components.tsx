"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Action } from "./action";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AudioLines } from "lucide-react";
import { formatCurrency, convertAmountFromMiliunits } from "@/lib/utils";
import { Wallet, Rocket, Goal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { DataTable } from "@/app/dashboard/transactions/data-table";
import { GlobalDataTable } from "@/components/data-table";
import { detailsColumns } from "@/app/dashboard/details/details-columns";
import { columns } from "../transactions/columns";

const CellComponent = ({ row, filters }: { row: any; filters: any }) => {
  const [showTransactions, setShowTransactions] = useState(false);
  const [showDetailsTransactions, setShowDetailsTransactions] = useState(false);
  console.log(row.original?.budget);
  console.log(row.original?.spent);
  const percentageSpent =
    (Math.abs(row.original?.spent) / Math.abs(row.original?.budget)) * 100;
  console.log(percentageSpent);
  return (
    <div className="mr-4">
      <div className=" px-2 flex justify-between items-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
        <Action id={row.original.id} />
      </div>
      <Card className=" flex-1 border-none shadow-xs p-10">
        <CardHeader className=" flex items-center md:items-start justify-center px-0">
          <CardTitle className="text-3xl font-bold underline decoration-4  decoration-sky-500 flex items-center gap-1 bg-gradient-to-r from-slate-900 from-50% to-blue-950 to-10% text-transparent bg-clip-text ">
            {" "}
            <AudioLines className="size-3 text-slate-500" />{" "}
            {row.original?.name}
          </CardTitle>
          <CardDescription className="text-sm font-semibold text-slate-700 mb-2">
            Budget Overview
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div>
            <div className="mb-4">
              <div className="flex flex-col lg:flex-row mb-8 gap-4">
                <div className="hover:bg-slate-100 rounded-sm shadow-sm flex-1 flex  bg-slate-50 flex-col  items-center justify-center gap-1 p-4">
                  <h4 className="text-sm font-medium  text-gray-600 mb-1">
                    Remaining
                  </h4>
                  <div className="text-xl gap-1 flex items-center justify-center font-light">
                    <Wallet className="size-4 text-green-500" />
                    <span className="font-extrabold underline decoration-green-500 ">
                      {formatCurrency(
                        convertAmountFromMiliunits(
                          row.original?.budget + row.original?.spent,
                        ),
                      )}
                    </span>
                  </div>
                </div>
                <div className=" flex-1 hover:bg-slate-100 rounded-sm shadow-sm flex flex-col bg-slate-50 items-center justify-center gap-1 p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Spent
                  </h4>
                  <div className="text-xl flex gap-1 items-center justify-center font-light">
                    <Rocket className="size-4 text-red-500" />
                    <span className="font-extrabold underline decoration-red-500 ">
                      {formatCurrency(
                        convertAmountFromMiliunits(row.original?.spent),
                      )}
                    </span>
                  </div>
                </div>
                <div className=" flex hover:bg-slate-100 rounded-sm shadow-sm flex-1 flex-col bg-slate-50 items-center justify-center gap-1 p-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">
                    Budget
                  </h4>
                  <div className="text-xl gap-1 flex items-center justify-center font-light">
                    <Goal className="size-4 text-yellow-500" />
                    <span className="font-extrabold text-slate-900 underline decoration-yellow-500">
                      {formatCurrency(
                        convertAmountFromMiliunits(row.original?.budget),
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="relative h-1 mb-2 rounded-2xl">
                <motion.div
                  className="absolute bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% h-1 text-sm rounded-2xl max-w-full top-0 right-0 bottom-0 left-0"
                  initial={{ width: "0%" }}
                  animate={{ width: `${percentageSpent.toFixed(2)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <span className="absolute drop-shadow-lg inset-0 font-bold text-slate-950 flex items-center justify-center">
                    {percentageSpent.toFixed(2)}%
                  </span>
                </motion.div>
              </div>
              <p className="text-xs text-gray-500 mb-2 mt-1">
                <span className="text-blue-900 text-sm font-semibold ">
                  {percentageSpent.toFixed(2)}%
                </span>{" "}
                of budget utilized
              </p>
            </div>

            <div className="flex flex-col lg:flex-row justify-between  gap-2 m-2">
              <Button
                onClick={() => {
                  if (showDetailsTransactions)
                    setShowDetailsTransactions(!showDetailsTransactions);
                  setShowTransactions(!showTransactions);
                }}
                variant="outline"
                className={`w-full ${showTransactions ? "bg-white text-slate-950 border-2 border-slate-950" : "bg-slate-950 text-white"} hover:bg-gray-50`}
              >
                {showTransactions ? "Hide Transactions" : "Show Transactions"}
                {showTransactions ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowDetailsTransactions(!showDetailsTransactions);
                  if (showTransactions) setShowTransactions(!showTransactions);
                }}
                variant="outline"
                className={`w-full ${showDetailsTransactions ? "bg-white text-slate-950 border-2 border-slate-950" : "bg-slate-950 text-white"} hover:bg-gray-50`}
              >
                {showDetailsTransactions
                  ? "Hide Details Transactions"
                  : "Show Details Transactions"}
                {showDetailsTransactions ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="w-full overflow-hidden">
              <AnimatePresence>
                {showTransactions && row.original?.transactions && (
                  <motion.div
                    key={`transactions-${row.id}`}
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { height: "auto", opacity: 1 },
                      collapsed: { height: 0, opacity: 0 },
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.04, 0.62, 0.23, 0.98],
                    }}
                    className="w-full overflow-x-auto"
                  >
                    <div className="w-[60svw] lg:w-full ">
                      <DataTable
                        filterKeys={filters}
                        columns={columns}
                        data={row.original?.transactions}
                        onDelete={(rows) => {
                          const ids = rows.map((row) => row.original.id);
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showDetailsTransactions &&
                  row.original?.detailsTransactions && (
                    <motion.div
                      key={`detailsTransactions-${row.id}`}
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={{
                        open: { height: "auto", opacity: 1 },
                        collapsed: { height: 0, opacity: 0 },
                      }}
                      transition={{
                        duration: 0.3,
                        ease: [0.04, 0.62, 0.23, 0.98],
                      }}
                      className="w-[60svw] lg:w-[95%]"
                    >
                      <div className="">
                        <GlobalDataTable
                          filterKey="name"
                          columns={detailsColumns}
                          data={row.original?.detailsTransactions}
                          onDelete={(rows) => {
                            const ids = rows.map((row) => row.original.id);
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CellComponent;
