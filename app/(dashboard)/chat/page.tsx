"use client"
import { CirclePlus } from "lucide-react"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { CircleX } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Mic } from "lucide-react"
import { Paperclip } from "lucide-react"
import {useState,useRef,useEffect} from "react"
import { Avatar } from "@/components/ui/avatar"
import { useContext } from "react"
import { ThemeContext } from "@/components/ContextProvider"
/* import DOMPurify from "dompurify" */
import axios from "axios"
import { Bot } from "lucide-react"
import { Button } from "@/components/ui/button"



type user = "AI"|"user"
interface Message {
    sender:user,
    content:string
}


const Chat = () =>{
    
    const {ip} = useContext(ThemeContext)
    const [threadId,setThreadId]=useState("")
    const [messages,setMessage] = useState<Message[]>([
            {sender:"user",content:"So I started to walk into the water. I won't lie to you boys, I was terrified. But I pressed on, and as I made my way past the breakers a strange calm came over me. I don't know if it was divine intervention or the kinship of all living things but I tell you Jerry at that moment, I was a marine biologist."}
        ])
    const [fileNames,setFilenames] = useState<string[]>([])
    const [formData,setformData] = useState({question:"",Files:[]})
    console.log(formData.Files)
    const chat = useRef<HTMLDivElement>(null)
/*     const editorRef = useRef<HTMLDivElement>(null) */

  /*   const [value, setValue] = useState('') */
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(()=>{
        if(chat.current){
            chat.current.scrollTop=chat.current.scrollHeight;
        }
        
    },[messages])
    useEffect(() => {
        if (textareaRef.current) {
        // Reset height - important to shrink on delete
        textareaRef.current.style.height = "50px"
        // Set height
        const scrollHeight = textareaRef.current.scrollHeight
        textareaRef.current.style.height = scrollHeight + "px"
        }
    }, [formData.question])

    const formatText = (text:string)=>{
        text = text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
        text = text.replace(/_(.*?)_/g,'<em>$1</em>')

        return text
    }
   
    const handleSubmit = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
            e.preventDefault()
            const formD = new FormData()
            console.log(formData.question)
            formD.append("question",formData.question)
            formData.Files.forEach(file=>formD.append("file",file))
/*             for (let entry of formD.entries()) {
                console.log(entry[0] + ': ' + entry[1]);
            } */
            formD.append("threadId",threadId)
            const newMessage:Message ={
                sender:"user",
                content: formData.question
            }

            setMessage(messages=>[...messages,newMessage])
            setformData({question:"",Files:[]})
            axios.post("http://localhost:3000/api/conversation",formD)
            .then(response =>{
                
                const AIresponse = formatText(response.data.response.output)
                setThreadId(response.data.response.threadId)
                 console.log(AIresponse)
                const AIMessage:Message = {
                 sender:"AI",
                 content:AIresponse
                }
     
                setMessage(messages=>[...messages,AIMessage])
             })
             .catch(
                err => console.log(err)
             )
        
        }
    
    const handleOnchange = (e)=>{
        if(e.target.files){
            console.log(e.target.files)
            const {files:filesList} = e.target
            const files = Array.from(filesList); 

           console.log(files)
           setformData(prev =>({
            ...prev,
            Files: [...prev.Files, ...files] // Append new files without direct mutation
        }))

        setFilenames(prev => {
            const newFileNames = files.map(file => file.name);
            return [...prev, ...newFileNames]; // Add new filenames to the list
        });
        }else{
            const {name,value} = e.target
            setformData(prev=>({
            ...prev,
            [name]:value
        }))
        console.log({value,name})
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>,) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            /* handleSubmit() */
        }
    }
    

    const handleRemoveFile= (name:string)=>{
        console.log
       setformData(prev => 
       ({...prev,
        Files:prev.Files.filter(file => file.name !== name)})
       )

       setFilenames(prev=>  prev.filter(nm => nm !== name))

    }
   
    return(
        <div className="fixed bottom-5 top-5 overflow-hidden right-5 pt-16 rounded-lg border-double border-[2px] bg-slate-100 border-slate-400 w-3/8" > 
                <div className=" p-4 flex shadow-md items-center gap-2 justify-start absolute top-0 left-0 right-0 border-b-[2px] h-16" >
                    <div className="text-2xl h-full">
                       <strong>AI</strong>
                    </div>
                    <Bot className="size-8"/>
                </div>

                <div ref={chat} className="bg-slate-50 mt-4 overflow-y-auto h-[calc(100%-180px)]">
                    {
                    messages.map((message,index)=>{
                            const sender = message.sender
                        return(
                            <div key={index} className={`flex ${sender==="user"?"text-left items-center":"text-left items-start" } mr-4 ml-1`} >
                                {sender ==="AI" && <div>
                                    <Avatar className="bg-slate-800 shadow-md mt-1 text-white flex items-center justify-center">AI</Avatar>
                                </div>}
                                <div  className={`word-break p-4 whitespace-pre-wrap break-words shadow-md border-slate-50 border-[1px] ${sender==="user"?"bg-slate-300 max-w-full":"bg-white w-full"  } rounded-xl p-1 overflow-auto ml-3 mr-3 mb-3 `} dangerouslySetInnerHTML={{__html:message.content}} />
                            </div>
                        )
                    })
                }
                </div>
                
            <form onSubmit={handleSubmit} action="">
                <div className="absolute m-2  bottom-0 flex max-w-full flex-col left-0 right-0" >
                    
                    <div className="flex flex-1  max-w-full items-end justify-around  ">
                     
                        <div className="flex-1 max-w-full mb-2 pr-3 pl-3 " >
                            <Textarea
                                id="chat-main-textarea"
                                onKeyDown={handleKeyDown}
                                name="question"
                                placeholder="Ask a follow up…"
                                value={formData.question}
                                onChange={handleOnchange}
                                className={cn(
                                "resize-none overflow-auto w-full flex-1 rounded-xl bg-white/50 p-3 pb-1.5 text-sm",
                                "outline-none ring-0 shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0",
                                "min-h-[42px] max-h-[384px]"
                                )}
                                style={{
                                height: textareaRef.current ? `${textareaRef.current.scrollHeight}px` : 'auto'
                                }}
                            />            
                            </div>
                        
                    </div>
                    <div className="flex justify-between items-center pt-0 p-4 flex-1 gap-2">
                       
                            <div className="relative flex gap-2 items-center bg-slate-500 cursor-pointer text-white shadow-lg p-3 rounded-sm" >
                                <Button
                                    variant="ghost"
                                    type="button"
                                    className="flex items-center p-1"
                                    onClick={() => document.getElementById('mic')?.click()}
                                    >
                                        <Mic className="size-5" />
                                        <input
                                            name="mic"
                                            id="mic"
                                            type="file"
                                            className="hidden" 
                                            onChange={handleOnchange}
                                        />
                                </Button>
                                |
                                <Button
                                    variant="ghost"
                                    type="button"
                                    className="flex items-center p-1"
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                    >
                                        <Paperclip className="size-5" />
                                        <input
                                            id="file-upload"
                                            type="file"
                                            name="file"
                                            className="hidden" 
                                            onChange={handleOnchange}
                                        multiple/>
                                </Button>
                                
                            </div>
                                <div className="absolute left-32 bg-white px-3 rounded-md max-h-[70px] overflow-y-auto">
                                {
                                    fileNames.map((name,index)=>{

                                        return(
                                            <div className="text-black flex items-center gap-1 justify-between" key={index}>
                                                {name}
                                                <CircleX onClick={()=>handleRemoveFile(name)}  className="size-4 text-amber-700 hover:cursor-pointer"/>
                                            </div>
                                        )
                                    })
                                }
                                </div>
                            <button type="submit" className="flex shadow-lg items-center gap-2 hover:bg-black/50% bg-black text-white p-3 rounded-sm cursor-pointer">
                                Send <Send className="size-5" />
                            </button>
                                           
                        </div>
                  
                </div>
             </form> 
        </div>
    
    )
}

export default Chat
