import {format} from "date-fns"

import { formatCurrency } from "@/lib/utils"
import {Separator} from "@/components/ui/separator"



export const CustomTooltip = ({active,payload}:{
    active:any,
    payload:any
})=>{
 if(!active){
    return null
 }

 const date = payload[0].payload.date;
 const income = payload[0].value;
 const expenses = payload[1].value;




return (
    <div className="border shadow-sm rounded-sm bg-white overflow-hidder" >
        <div className="text-sm bg-muted p-2 p-x-3 text-muted-foreground">
            {format(date,"MMM dd,yyy")}
        </div>
        <Separator />
        <div className="p-2 p-x-3 space-y-1">
            <div className="flex items-center justify-between gap-x-4" >
                <div className="flex items-center gap-x-2" >
                    <div className="size-1.5 bg-blue-500 rounder-full" />
                    <p className="text-sm text-muted-foreground" >
                        Income
                    </p>
                </div>
                <p className="text-sm text-right font-medium" >
                    {formatCurrency(income)}
                </p>
            </div>
            <div className="flex items-center justify-between gap-x-4">
                <div className="flex items-center gap-x-2">
                    <div className="size-1.5 bg-rose-500 rounded-full"/>
                    <p className="text-sm text-muted-foreground">
                        Expenses
                    </p>
                </div>
                    <p className="text-sm text-right font-medium" >
                        {formatCurrency(expenses * - 1)}
                    </p>
            </div>
        </div>
    </div>
)

}