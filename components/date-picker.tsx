import * as React from "react"
import { Calendar } from "./ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover"
import {SelectSingleEventHandler} from "react-day-picker"
import { CalendarIcon } from "lucide-react"
import { Button } from "./ui/button"
import {format} from "date-fns"
import {cn} from "@/lib/utils"

type Props ={
    value?:Date,
    onChange?:SelectSingleEventHandler,
    disabled?:boolean
}

export const DatePicker = (
    {
        value,
        onChange,
        disabled
    }:Props
)=>{
    return(
        <Popover>
            <PopoverTrigger>
                <Button
                    variant="outline"
                    disabled={disabled}
                    className={
                        cn(
                            "w-full text-left justify-start font-normal",
                            !value && "text-muted-foreground",
                        )
                    }
                >
                    <CalendarIcon className="size-4 mr-2" />
                    {value ?format(value,"PPP"):<div>Pick a Date</div>}
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <Calendar 
                    mode="single"
                    disabled={disabled}
                    selected={value}
                    onSelect={onChange}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}