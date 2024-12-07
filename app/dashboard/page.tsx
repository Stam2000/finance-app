"use client"

import { createId } from "@paralleldrive/cuid2"
import {DataGrid} from "@/components/data-grid"
import {DataCharts} from "@/components/data-charts"
import {useState,useContext} from "react"
import {ThemeContext} from "@/components/context-provider";
import { useGenFollowUpQ } from "@/features/chat/api/use-follow-up";
import { useUpdateChat } from "@/features/chat/hook/use-update-message";
import { useGetWeeklyAnalyse } from "@/features/chat/hook/use-get-week-summary";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

export default  function Home() {
    const {ip,updateIp} = useContext(ThemeContext)

    const {toggleChatOpen,chatOpen} = useContext(ThemeContext)
    const genFollowUpQ = useGenFollowUpQ()
    const {personaDes,followHistory,setFollowQ,setWRshort,setWRlong} = useUpdateChat()
    const {
      mutate,
      isError,
      data,
      error,
      isPending
    } = useGetWeeklyAnalyse() 

    



    const handleFetchWeeklyAnalyse = () => {
      mutate({ personaDes },{
        onSuccess: (data) => {
          setWRshort(data.reducedText);
          setWRlong(data.res)
        },
      });
    };


   /*  let WeekResumeShort = weekQuery.data?.reducedText 
    let WeekResumeLong = weekQuery.data?.res */


    const handleClick = () => {
        // Call the mutation function with the required payload
        genFollowUpQ.mutate(
          {personaDes,followHistory},
          {
            onSuccess: (data) => {
              // Handle the successful response
              setFollowQ(data);
            },
            onError: (error) => {
              // Handle any errors
              console.error('Error occurred:', error);
            },
          }
        );
      };

      const [renderKey, setRenderKey] = useState(createId());
      const rerender = ()=>{
        setRenderKey(createId())
    }

    return (

    <div key={renderKey} className="max-w-screen-2xl flex-1 w-full mx-auto pb-10">
        
        <DataGrid/>
          <Button  className="p-3 mb-3" onClick={rerender} >
              <RefreshCcw size={16} />
          </Button>
        <DataCharts/>
    </div>

  );
}
