"use client"
import QuestionChat from "./AiQuestion";


export const WelcomeMsg =()=>{

    return(
        <div className="space-y-4 mb-4" >
            <h1 className="text-2xl lg:text-4xl text-white font-medium" >
                Welcome Back,John💎!
            </h1>
            <QuestionChat />
            <p className="text-sm text-[#dfecff] lg:text-base" >
                This is your Financial Overview Report
            </p>
        </div>
    );
};