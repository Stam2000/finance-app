"use client"

import * as React from "react"
 
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Ghost } from "lucide-react"


type Props = {
    filterKeys:string[],
    onChange:(value:string)=>void
    filterkey:string
}

export function SelectFilterKey ({filterKeys,onChange,filterkey}:Props){

    return(
        <div className="ml-3 flex gap-2" >
            <Select
            onValueChange={(value)=>onChange(value)}
            value={filterkey ? filterkey : ""}
                >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="filter" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                {filterKeys.map(filterkey=><SelectItem key={filterkey} value={filterkey}>{filterkey}</SelectItem>)}
                </SelectGroup>
            </SelectContent>
            </Select>

        {
            filterkey && <Button  variant={"ghost"} onClick={()=>onChange("")} >reset</Button>
        }
        </div>
        
    )
}