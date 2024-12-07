import { Input } from "./ui/input"
import { sendAiMessage } from "@/lib/utils"
import { useUpdateChat } from "@/features/chat/hook/use-update-message"
import { useOpenChat } from "@/features/chat/hook/use-open-AIchat"
import { useState } from "react"


const QuestionChat = ()=>{
    const {threadId,setThreadId, setIsLoading,updateLastMessage,updateMessage, setFormData, formData,personaInfo} = useUpdateChat();
    const {toggleChatOpen} = useOpenChat()
    const [value,setInputValue] = useState('')
    const personaId = localStorage.getItem('selectedPersona') || "testData"  
    const handleOnChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
        setInputValue(e.target.value)
        setFormData({question:e.target.value})
    }

    const handleSubmit= (e: React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
         sendAiMessage({threadId,setIsLoading,setThreadId,updateLastMessage,updateMessage,formData,setFormData,personaId,personaInfo})
        toggleChatOpen()
        setInputValue("")   
    }


    return(
        <div className="w-full flex flex-col gap-4">
            <form onSubmit={handleSubmit}>
            <Input
            value={value}
            onChange={handleOnChange}
            placeholder="Ask Ai"
            className="
            placeholder:text-white/70
            transition-colors
            bg-white/10 focus:bg-white/30 text-white
              w-full
            focus-visible:ring-0
            focus-visible:ring-offset-0
             p-6
            "/>
            </form>
        </div>
    )
}
export default QuestionChat