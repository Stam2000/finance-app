"use client"

import {FaPiggyBank} from "react-icons/fa";
import {useSearchParams} from "next/navigation";
import {FaArrowTrendUp, FaArrowTrendDown} from "react-icons/fa6"
import { useGetSummary } from "@/features/summary/api/use-get-summary";
import {formatDateRange} from "@/lib/utils";
import {DataCard,DataCardLoading} from "@/components/data-card"
import { motion } from "framer-motion";

export const DataGrid = ()=>{
    const {data,isLoading} = useGetSummary();

    const params = useSearchParams()
    const from = params.get("from")||""
    const to = params.get("to")||""

    const dataRangeLabel = formatDateRange({to,from});
    
    if(isLoading){
        <div className=" grid grid-cols-1 lg:grid-cols-3 pb-2 mt-8" >
            <DataCardLoading />
            <DataCardLoading />
            <DataCardLoading />
        </div>
    }

    return(
        <div className="grid grid-cols-1 lg:grid-cols-3 pb-2 gap-8 mb-1">
            <DataCard 
               title="Remaining"
               value ={data?.remainingAmount}
               percentageChange={data?.remainingChange}
               icon={FaPiggyBank}
        	    dateRange={dataRangeLabel}
            />
            <DataCard
                title="Income"
                value={data?.incomeAmount}
                percentageChange={data?.incomeChange}
                icon={FaArrowTrendUp}
                dateRange={dataRangeLabel}
            />
            <DataCard
                title="Expenses"
                value={data?.expensesAmount}
                percentageChange={data?.expensesChange}
                icon={FaArrowTrendDown}
                dateRange={dataRangeLabel}
            />
        </div>
    )
}