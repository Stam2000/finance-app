"use client"

import { DateRange} from "react-day-picker";
import { useSearchParams,usePathname,useRouter } from "next/navigation";
import qs from "query-string";

import { useState } from "react";
import { subDays,format } from "date-fns";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    PopoverClose,
  } from "@/components/ui/popover";
  import { Button } from "./ui/button";
  import { Calendar } from "./ui/calendar";
  import { formatDateRange } from "@/lib/utils";
  import { ChevronDown } from "lucide-react";
 

export const DataFilter = ()=>{
    const router = useRouter()
    const pathname = usePathname()
    const params = useSearchParams()

    const accountId= params.get("accountId")
    const from = params.get("from")|| ""
    const to = params.get("to")||""

    const defaultTo = new Date()
    const defaultFrom = subDays(defaultTo,30)

    const paramState = {
        from:from?new Date(from):defaultFrom,
        to:to?new Date(to):defaultTo
    }

    const [date,setDate]= useState<DateRange|undefined>(
        paramState
    );


    const pushToUrl = (dateRange:DateRange|undefined)=>{
        const query ={
            from: format(dateRange?.from || defaultFrom, "yyyy-MM-dd"),
            to:format(dateRange?.to||defaultTo,"yyyy-MM-dd"),
            accountId,
        };

        const url = qs.stringifyUrl(
            {url:pathname,
            query},{skipEmptyString:true, skipNull: true}
        )

        router.push(url)

    }

    const onReset = ()=>{
        setDate(undefined),
        pushToUrl(undefined)
    }


    return(
        <Popover>
            <PopoverTrigger asChild >
                <Button
                    disabled={false}
                    size="sm"
                    className="lg:w-auto mw-[200px] h-9 font-normal focus:ring-offset-0 focus:ring-transparent outline-none transition focus:bg-white/30 rounded-md px-3  text-white bg-white/10 hover:bg-white/20 border-none  hover:text-white  "
                >
                    <span>{formatDateRange(paramState)}</span>
                <ChevronDown className="ml-2 size-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                	className="lg:w-auto w-full p-0"
            >
                <Calendar 
                    disabled={false}
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}  
                />

                <div className="p-4 w-full flex items-center gap-x-2">
                    <PopoverClose asChild>
                        <Button 
                            onClick={onReset}
                            disabled={!date?.from || !date?.to}
                            className="w-full"
                        >
                         Reset
                        </Button>
                    </PopoverClose>
                    <PopoverClose asChild>
                        <Button
                            onClick={()=>pushToUrl(date)}
                            disabled={!date?.from || !date?.to}
                            className="w-full"
                        >
                            Apply
                        </Button>
                    </PopoverClose>   
                </div>  
            </PopoverContent>   
        </Popover>
    )
} 