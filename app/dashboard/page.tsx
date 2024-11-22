"use client"
import Image from "next/image";
import {DataGrid} from "@/components/data-grid"
import {DataCharts} from "@/components/data-charts"
import {useState,useEffect,useContext} from "react"
import {ThemeContext} from "@/components/ContextProvider";
import {useGetip} from "@/features/useGetip";
import { useGenFollowUpQ } from "@/features/chat/api/use-follow-up";
import { useUpdateChat } from "@/features/chat/hook/useUpdateMessage";
import { useGetWeeklyAnalyse } from "@/features/chat/hook/useGetWeekSummary";

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
      useEffect(()=>{
        handleClick()
        
      },[])
      
    /*  useEffect(()=>{
        handleFetchWeeklyAnalyse()
     },[personaDes]) */

    return (

    <div className="max-w-screen-2xl flex-1 w-full mx-auto pb-10">
        <DataGrid/>
        <DataCharts/>
    </div>

  );
}
