import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { eachDayOfInterval,isSameDay,format,subDays } from "date-fns";
import axios from "axios";


type user = "AI"|"user"
interface Message {
  sender:user,
  content:string
}
interface FormData {
  question: string;
  Files: File[];
}

export function convertAmountFromMiliunits(amount:number){
  return amount / 1000;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fillMissingDays(
  activeDays:{
    date:Date,
    income:number,
    expenses:number
  }[],
  startDate:Date,
  endDate:Date
){
  if(activeDays.length ===0) return []

  const allDays = eachDayOfInterval(
   { start: startDate,
    end:endDate}
  )

  


  const transactionsByDay = allDays.map((day)=>{
    const found = activeDays.find((d)=> isSameDay(d.date,day));

    if(found){
      return found
    }else{
      return{
        date:day,
        income:0,
        expenses:0
      }
    }
  })

  return transactionsByDay
}



export function formatCurrency(value:number){
  return Intl.NumberFormat("en-Us",{
    style:"currency",
    currency:"USD",
    minimumFractionDigits:2,
  }).format(value);
}

export function convertAmountFormMiliunits(amount:number){
  return amount/1000
};

export function convertAmountToMiliunits(amount:number){
  return Math.round(amount*1000)
}

export function calculatePercentageChange(
  current:number,
  previous:number
){
  if(previous ===0){
    return previous === current ? 0: 100;
  }

  return ((current-previous)/previous)*100
};

type Period = {
  from:string|Date|undefined,
  to:string|Date|undefined
}

export function formatDateRange(period?:Period){
  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo,30);

  if (!period?.from){
    return `${format(defaultFrom, "LLL dd")}-${format(defaultTo,"LLL dd, y")}`
  }

  if(period.to){
    return `${format(period.from,"LLL dd")}-${format(period.to,"LLL dd, y")}`
  }

  return format(period.from, "LLL dd,y")
}

export function formatPercentage(
  value:number,
  options:{addPrefix?:boolean}={
    addPrefix:false
  }
){
const result = Intl.NumberFormat("en-US",{
  style:"percent"
}).format(value/100)

if(options.addPrefix && value > 0){
  return `+${result}`
}

return result
}

export const formatText = (text: string) => {
  // Replace Heading 3 (### text)
  text = text.replace(/^###\s*(.+)$/gm, '<h3>$1</h3>');
  
  // Replace Heading 4 (#### text)
  text = text.replace(/^####\s*(.+)$/gm, '<h4>$1</h4>');

  // Replace Bold (**text**)
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Replace Italic (_text_)
  text = text.replace(/_(.*?)_/g, '<em>$1</em>');

  // Replace Links ([text](url))
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  // Replace Strikethrough (~~text~~)
  text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');

  return text;
};

export const sendAiMessage = ({threadId,setThreadId,updateLastMessage,updateMessage,formData,message,setFormData,setIsLoading}:{
  updateMessage: (message: Message) => void;
  formData: FormData;
  setFormData: (data: Partial<FormData>) => void;
  threadId:string;
  message?:string;
  updateLastMessage: (content: string) => void;
  setThreadId:(threadId:string)=>void;
  setIsLoading:()=>void
})=>{
      setIsLoading()
      const formD = new FormData()
      const mss = message  ? message : formData.question
      formD.append("question", mss)
      formData.Files.forEach(file=>formD.append("file",file))
      formD.append("threadId",threadId)
      const newMessage:Message ={
          sender:"user",
          content: mss
      }



      updateMessage(newMessage)
      const AIMessage:Message = {
        sender:"AI",
        content:""
       }
       updateMessage(AIMessage)
      setFormData({question:"",Files:[]})

      axios.post("http://localhost:3000/api/conversation",formD)
      .then(response =>{
         
          const AIresponse = formatText(response.data.response.output)
          setThreadId(response.data.response.threadId)
          /* const AIMessage:Message = {
           sender:"AI",
           content:AIresponse
          } */
          
          updateLastMessage(AIresponse)
          setIsLoading()
       })
       .catch(
          err => {setIsLoading()
            console.log(err)}
          
       )
}