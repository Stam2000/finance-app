"use client"
import QuestionChat from "./AiQuestion";
import { useUpdateChat } from "@/features/chat/hook/useUpdateMessage";
import { useEffect } from "react";



export const WelcomeMsg =()=>{
    const {personaInfo} = useUpdateChat()
    let i = {name:""}
    if(personaInfo){
        i = JSON.parse(personaInfo)
    }
    console.log(personaInfo)



    return(
        <div className="space-y-4 mb-4" >
            <h1 className="text-2xl lg:text-4xl text-white font-medium" >
                Welcome Back, {personaInfo && i.name}
            </h1>
            <QuestionChat />
            <p className="text-sm text-[#dfecff] lg:text-base" >
                This is your Financial Overview Report
            </p>
        </div>
    );
};