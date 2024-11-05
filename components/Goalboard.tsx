import { Input } from "./ui/input"
import { sendAiMessage } from "@/lib/utils"
import { useUpdateChat } from "@/features/chat/hook/useUpdateMessage"
import { useOpenChat } from "@/features/chat/hook/use-open-AIchat"
import { useState } from "react"
import GoalOverview from "./goalOverview"
import WeekResult from "./week-resume"
import { ScrollArea } from "./ui/scroll-area"
/* import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from "@/components/ui/carousel" */
import Carousel from "./caroussel"




const GoalBoard = ()=>{
    const {threadId,setThreadId, messages, updateMessage, setFormData, formData, removeFile } = useUpdateChat();
    const {toggleChatOpen} = useOpenChat()
    const [value,setInputValue] = useState('')
    console.log(value)
    
    const handleOnChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
        setInputValue(e.target.value)
        console.log(e.target.value)
        setFormData({question:e.target.value})
        console.log(formData.question)
    }

    const handleSubmit= (e: React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
            console.log(value)
            console.log(formData)
            sendAiMessage({threadId,setThreadId,updateMessage,formData,setFormData})
            toggleChatOpen()
            setInputValue("")
    }
    return(
        <div className=" flex w- flex-grow flex-col items-center justify-center rounded-2xl gap-4">
           #
        </div>
    )
}
export default GoalBoard


