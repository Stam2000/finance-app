
import { Button } from "./ui/button"
import { useOpenWeeKOverview } from "@/features/chat/hook/use-open-weekOverview"
import { useUpdateChat } from "@/features/chat/hook/useUpdateMessage"
import { formatText } from "@/lib/utils"
import { MarkdownFormatter } from "@/lib/utils"

const WeekResult = ()=>{
  const {WRshort,WRlong}= useUpdateChat()
    const {onOpen} = useOpenWeeKOverview()
/*     const [htmlCode,setHtmlCode] = useState("")
    const [error, setError] = useState(null); */
    let weekResume = MarkdownFormatter.toHtml(WRshort)
    console.log(weekResume)
  
    
/*     weekResume=`<div>
  <h1 style="font-weight: bold; font-size: 1.125rem; padding-bottom: 0.5rem;">📊Weekly Financial Review</h1>
  <div style="padding-bottom: 1rem;">
    <ul>
      <li><span style="font-weight: 500;">Net Savings:</span> <span style="text-decoration: underline; text-decoration-thickness: 2px;">＄616</span> 💸</li>
      <li><span style="font-weight: 500;">Income vs Expenses:</span> Well-balanced 📈</li>
      <li><span style="font-weight: 500;">High Expense Area:</span>📚 Education <span style="text-decoration: underline; text-decoration-thickness: 2px;">＄155</span></li>
      <li><span style="font-weight: 500;">Controlled Areas:</span>🛒 Groceries <span style="text-decoration: underline; text-decoration-thickness: 2px;">＄63</span>, 🍽️ Dining <span style="text-decoration: underline; text-decoration-thickness: 2px;">＄34</span></li>
    </ul>
  </div>

  <div style="padding-bottom: 0.5rem;">
    <div style="display: flex; justify-content: flex-start; align-items: center; gap: 0.25rem; padding-bottom: 0.5rem;">
      🔍<h3 style="font-weight: bold;">Recommendations:</h3>
    </div>
    <ul>
      <li>Maximize freelance income 💼</li>
      <li>Monitor grocery spending 🛒</li>
      <li>Invest savings for future growth 💰</li>
    </ul>
  </div>
</div>` */

    

    return(
        <div className="flex align-center p-4 bg-gray-50 flex-col justify-center">
            <div>
                <div className="" dangerouslySetInnerHTML={{__html:weekResume}} />
            </div>
            <div className="flex items-center justify-center" >
                <Button className="bg-slate-300 hover:text-white w-[50%] wx-auto text-slate-700 border-2" onClick={onOpen} >
                    Full Review
                </Button>
            </div>
            
        </div>
    )
}


export default WeekResult
