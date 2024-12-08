"use client"

import {Header} from"@/components/header"
import { Button } from "@/components/ui/button"
import React from "react"
import { useOpenChat } from "@/features/chat/hook/use-open-AIchat"
import { OverviewWeekFinanceDialog } from "@/features/chat/component/week-review-overview-dialog"
import { MessagesSquare } from "lucide-react"
import { AnimatePresence,motion,Variants} from "framer-motion"
import Chat from "@/components/chat"



type Props = {
    children: React.ReactNode
}


export default function DashboardLayout({children}:Props){
    const {chatOpen,toggleChatOpen} = useOpenChat()


    return(
        <motion.div 
        animate={chatOpen ? "open" : "close"}
        >
                 <OverviewWeekFinanceDialog />
                <Header  />
                      
                        <motion.main 
                        animate={{ width: chatOpen ? '60%' : '100%' }}
                        transition={{ type: 'tween',duration:0.1 }}
                
                            className={`px-1 relative -mt-24 lg:px-14 ${chatOpen ? "lg:px-6":"lg:px-14"}`} 
                        >
                            {children}
                        </motion.main>      
                        <Chat />
            <motion.button
                 initial={false}
                 animate={{ scale : chatOpen ? 0 :[1.1,1],
                     opacity:chatOpen ? 0 : 1
                  }}

                onClick={toggleChatOpen} className={`inline-flex items-center justify-center 
                whitespace-nowrap rounded-md text-sm 
                font-medium ring-offset-background 
                transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
                focus-visible:ring-offset-2 disabled:pointer-events-none 
                disabled:opacity-50 text-primary-foreground hover:bg-primary/90  px-4 py-2 fixed bg-gradient-to-r 
                from-slate-900 from-10%  to-slate-700 to-90% bottom-2 left-2 h-16 w-16 rounded-r-3xl rounded-l-3xl`} >
                <MessagesSquare className="  size-16"/>
            </motion.button>
       
        </motion.div >
    )
}
