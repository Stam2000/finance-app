"use client"
import Image from "next/image";
import {DataGrid} from "@/components/data-grid"
import {DataCharts} from "@/components/data-charts"
import {useState,useEffect,useContext} from "react"
import {ThemeContext} from "@/components/ContextProvider";
import {useQuery} from "@tanstack/react-query"
import {useGetip} from "@/features/useGetip";
import { motion } from "framer-motion";



export default function Home() {
    const {ip,updateIp} = useContext(ThemeContext)
    /* console.log(ip) */
    const {data,isLoading} = useGetip()
    const {toggleChatOpen,chatOpen} = useContext(ThemeContext)    

    /* useEffect(()=>{
        if (data) {
            updateIp(JSON.stringify(data));
        }
    },[data,updateIp]) */

    return (

    <div className="max-w-screen-2xl flex-1 w-full mx-auto pb-10">

        <DataGrid/>
        <DataCharts/>
    </div>

  );
}
