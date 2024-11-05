"use client"

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card"
import { Skeleton } from "./ui/skeleton"
import { AreaVariant } from "./area-variant"
import {LineVariant} from "./line-variant"
import { BarVariant } from "./bar-variant"


import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectValue,
    SelectItem,
} from "@/components/ui/select"

import {AreaChart,BarChart3,FileSearch,LineChart,Loader2} from "lucide-react"
import {useState} from "react"

type Props ={
    data?:{
        date:string;
        income:number;
        expenses:number
    }[];
};

export const Chart = ({data=[]}:Props) =>{
    const [chartType,setChartType]=useState("area");

    const onTypeChange=(type:string)=>{
            setChartType(type)
    }

   return ( <Card className="border-none drop-shadow-sm" >
        <CardHeader className="flex space-y-2 lg:flex-row lg:space-y-0 justify-between lg:items-center"  >
            <CardTitle className=" text-xl line-clamp-1" >
                transactions
            </CardTitle>
            <Select
                defaultValue={chartType}
                onValueChange={onTypeChange}
            >
                <SelectTrigger className="lg:w-auto h-9 rounded-md px-3" >
                    <SelectValue placeholder="Chart type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="area">
                        <div className="flex items-center" >
                            <AreaChart className="size-4 mr-2 shrink-0" />
                            <p className="line-clamp-1">
                                Area Chart
                            </p>
                        </div>
                    </SelectItem>
                    <SelectItem value="line">
                        <div className="flex items-center" >
                            <LineChart className="size-4 mr-2 shrink-0" />
                            <p className="line-clamp-1">
                                Line Chart
                            </p>
                        </div>
                    </SelectItem>
                    <SelectItem value="bar">
                        <div className="flex items-center" >
                            <BarChart3 className="size-4 mr-2 shrink-0" />
                            <p className="line-clamp-1">
                                Bar Chart
                            </p>
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>            
        </CardHeader>
        <CardContent>
            {
                data.length === 0 ?
                (<div className="flex flex-col gap-y-4 w-full items-center justify-center h-[350px] ">
                    <FileSearch className="size-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground" >
                        No data for this Period
                    </p>
                </div>):(
                    <>
                        {chartType === "line" && <LineVariant data={data} />}
                        {chartType === "area" && <AreaVariant data={data} />}
                        {chartType === "bar" && <BarVariant data={data} /> }
                    </>
                    
                )
            }
        </CardContent>
    </Card>)
}

export const ChartLoading =()=>{
    return(
        <Card className="border-none drop-shadow-sm" >
            <CardHeader>
                <CardTitle className="flex space-y-2 lg:flex-row lg:space-y-0 lg:items-center justify-between lg" >
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-8 lg:w-[120px] w-full" />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full flex items-center justify-center" >
                    <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
                </div>
            </CardContent>
        </Card>
    )
}