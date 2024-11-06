import { Sparkles, Zap,Clock,AlertCircle, Target, Cpu, Globe } from "lucide-react"
import { Goal,Rocket,Wallet,AudioLines } from "lucide-react"
import {motion} from "framer-motion"
import { useGetCategoriesAllTracking } from "@/features/categories/api/use-get-categories-tracking"
import { convertAmountFromMiliunits } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"


const GoalOverview = ()=>{
    const categoriesQuery = useGetCategoriesAllTracking()
    const categories = categoriesQuery.data||[]
    /* console.log(categories) */

    return(
    <div className="flex flex-col gap-2 my-2 flex-grow rounded-lg">
       {/*bar de progression*/}
       {
        categories.map((c,index)=>{
            let percentage = Math.min((Math.abs(c.amount) / c.goal!) * 100)
            let width=0
                percentage> 100 ? width=100:width=percentage
                percentage = parseFloat(percentage.toFixed(2))
            /* console.log(percentage) */
            
                return(
                    <div key={c.id} className="w-[90%] py-2 px-4  mx-auto border-[1px] rounded-sm shadow-sm bg-slate-50">
                    <div className="flex w-full justify-between items-center mb-2">
                        <h2 className="text-sm border-2 px-2   rounded-xl font-light flex gap-1 items-center capitalize justify-center  text-black"><AudioLines className="size-3 text-slate-500" />{c.name}</h2>
                        <div className="flex w-full justify-end gap-1  items-center">
                            <div className="flex items-center space-x-1">
                            <Wallet className="w-3 h-3 text-green-500" />
                            <div className="flex items-center justify-center gap-1">
                                <p className="text-sm text-slate-900">remaining:</p>
                                <p className="text-sm text-slate-600 border-b-2 rounded-md font-bold">{formatCurrency(convertAmountFromMiliunits(c.amount))}</p>
                            </div>
                            </div>  
                        </div>
                    </div>
                    <div className="relative bg-slate-100 h-1 rounded-2xl">
                        <motion.div className="absolute bg-gradient-to-l from-emerald-500 from-10% via-yellow-300 via-50% to-slate-100 to-90% h-1   text-sm rounded-2xl w-2/3 top-0 right-0 bottom-0 left-0"
                            initial={{width:"0%"}}
                            animate={{width:`${width}%`}}
                            transition={{duration:1 ,ease:"easeOut"}}
                        >
                        <span className="absolute drop-shadow-lg inset-0 font-semibold text-slate-900 flex items-center justify-center " >
                            {percentage}%
                            </span>  
                        </motion.div>
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-2  text-slate-900">
                    <div className="flex items-center justify-around space-x-1">
                                <Rocket className="w-3 h-3 text-red-500" />
                                <div className="flex items-center justify-center gap-1">
                                    <p className="text-sm  text-gray-900">spent:</p>
                                    <p className="text-sm text-slate-600 border-b-2 rounded-md font-bold">{formatCurrency(convertAmountFromMiliunits(c.amount))}</p>
                                </div>
                            </div >
                            -
                    <div className="flex items-center space-x-1">
                            <Goal className="w-3 h-3 text-yellow-500" />
                            <div className="flex items-center justify-center gap-1">
                                <p className="text-sm text-gray-900">limit:</p>
                                <p className="text-sm text-slate-600 border-b-2 rounded-md font-bold">{formatCurrency(convertAmountFromMiliunits(c.goal!))}</p>
                                </div>
                            </div>
                    </div>
                    </div>
            )
        })
       }
       
    </div>)
}

export default GoalOverview