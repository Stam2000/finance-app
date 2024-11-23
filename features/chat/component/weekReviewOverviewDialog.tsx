import {z} from "zod"
import React from "react"

import { Dialog,
        DialogContent,
        DialogDescription,
        DialogFooter,
        DialogHeader,
        DialogTitle 
    } from "@/components/ui/dialog2"


import { Button } from "@/components/ui/button"
import { useOpenWeeKOverview } from "../hook/use-open-weekOverview" 
import { useUpdateChat } from "../hook/useUpdateMessage"
import { useEffect } from "react"



export const OverviewWeekFinanceDialog =()=>{
    const {WRlong,WRshort}=useUpdateChat()
    const {isOpen,onClose} = useOpenWeeKOverview()
    let weekResume = WRlong
    useEffect(()=>{
        weekResume = WRshort
      },[WRshort,WRlong])
    console.log(`  WRlong : ${WRlong} `)


    

    return(
        <Dialog   open={isOpen}  onOpenChange={onClose} >
            <DialogContent className="rounded-2xl flex flex-col items-center" >
                <DialogHeader>
                    <DialogTitle>
                        Weekly Review
                    </DialogTitle>
                </DialogHeader>
                    <div>
                    <div className="flex flex-col align-center justify-center p-4" dangerouslySetInnerHTML={{__html:WRlong}} />
                    </div>
                <DialogFooter>
                    <Button onClick={onClose}>
                        Back
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
   
}