"use client"

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card"
import { Skeleton } from "./ui/skeleton"
import { PieVariant } from "./pie-variant"
import {RadarVariant} from "./radar-variant"
import { RadialVariant } from "./radial-variant"


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
        name:string;
        value:number;
    }[];
};

export const SpendingPie = ({data=[]}:Props) =>{
    const [chartType,setChartType]=useState("pie");

    const onTypeChange=(type:string)=>{
            setChartType(type)
    }

   return ( <Card className="border-none drop-shadow-sm" >
        <CardHeader className="flex space-y-2 lg:flex-row lg:space-y-0 justify-between lg:items-center"  >
            <CardTitle className=" text-xl line-clamp-1" >
                Categories
            </CardTitle>
            <Select
                defaultValue={chartType}
                onValueChange={onTypeChange}
            >
                <SelectTrigger className="lg:w-auto h-9 rounded-md px-3" >
                    <SelectValue placeholder="Chart type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="pie">
                        <div className="flex items-center" >
                            <AreaChart className="size-4 mr-2 shrink-0" />
                            <p className="line-clamp-1">
                                Pie
                            </p>
                        </div>
                    </SelectItem>
                    <SelectItem value="radar">
                        <div className="flex items-center" >
                            <LineChart className="size-4 mr-2 shrink-0" />
                            <p className="line-clamp-1">
                                Radar chart
                            </p>
                        </div>
                    </SelectItem>
                    <SelectItem value="radial">
                        <div className="flex items-center" >
                            <BarChart3 className="size-4 mr-2 shrink-0" />
                            <p className="line-clamp-1">
                                Radial Chart
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
                        {chartType === "pie" && <PieVariant data={data} />}
                        {chartType === "radar" && <RadarVariant data={data} />}
                        {chartType === "radial" && <RadialVariant data={data} /> }
                    </>
                    
                )
            }
        </CardContent>
    </Card>)
}

export const SpendingPieLoading =()=>{
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