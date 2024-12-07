"use client"
import QuestionChat from "./ai-question";
import { useUpdateChat } from "@/features/chat/hook/use-update-message";



export const WelcomeMsg =()=>{
    const {personaInfo} = useUpdateChat()
    const i = JSON.parse(personaInfo)


    return(
        <div className="space-y-4 mb-4" >
            <h1 className="text-2xl lg:text-4xl text-white font-medium" >
                Welcome Back,{i.name}
            </h1>
            <QuestionChat />
            <p className="text-sm text-[#dfecff] lg:text-base" >
                This is your Financial Overview Report
            </p>
        </div>
    );
};