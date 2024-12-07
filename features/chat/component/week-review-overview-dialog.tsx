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
import { useOpenWeeKOverview } from "../hook/use-open-week-overview" 
import { useUpdateChat } from "../hook/use-update-message"
import { useEffect } from "react"
import Animation from "@/components/animation"



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
                    <div >
                    {
                WRshort === 'Loading...' ? (<div className="flex flex-col mx-auto items-center justify-center my-4"><Animation 
                    initialColors = {["#595959", "#151515", "#8f8f8f", "#d9d9d9"]}
                    itemWidth ={20}
                    itemHeight = {25}
                    itemMarginRight = {4}
                    itemMarginBottom = {0}
                    containerWidth = {200} />
                    <span className="mt-2 text-slate-400 italic">AI is working...</span></div>) :(
                    <div className="flex flex-col align-center justify-center p-4" dangerouslySetInnerHTML={{__html:WRlong}} />)
              }
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