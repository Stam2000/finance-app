
import { Goal,Rocket,Wallet,AudioLines } from "lucide-react"
import {motion} from "framer-motion"
import { useGetCategoriesAllTracking } from "@/features/categories/api/use-get-categories-tracking"
import { convertAmountFromMiliunits } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"
import { Tag } from "lucide-react"



const GoalOverview = ()=>{
    const categoriesQuery = useGetCategoriesAllTracking()
    const categories = categoriesQuery.data||[]


    return(
    <div className="flex flex-col gap-2 my-2 flex-grow rounded-lg">
       {/*bar de progression*/}
       {
        categories.map((c,index)=>{
            let percentage = Math.min((Math.abs(c.amount) / c.goal!) * 100)
            let width=0
                percentage> 100 ? width=100:width=percentage
                percentage = parseFloat(percentage.toFixed(2))
 
            
                return(
                    <div key={c.id} className=" w-[90%] py-1 px-2  mx-auto border-[1px] rounded-sm shadow-sm bg-slate-50">
                    <div className="flex w-full justify-between items-center mb-2">
                        <h2 className="text-sm px-2 font-nunito font-bold  flex gap-1 items-center  justify-center  text-slate-800"><img className="object-cover rounded-xl h-4 "  src={`/tag-horizontal-svgrepo-com.svg`}  alt={"lg.displayName"}/> {c.name}</h2>
                        <div className="flex  justify-end gap-1  items-center">
                            <div className="flex items-center  space-x-1">
                            <div className="flex items-center justify-center gap-1">
                                <p className="text-sm font-nunito text-slate-900">remaining:</p>
                                <p className="text-sm text-green-800 ">{formatCurrency(convertAmountFromMiliunits(c.amount))}</p>
                            </div>
                            <Wallet className="w-4 h-4 text-green-700" />
                            </div>  
                        </div>
                    </div>
                    <div className="relative bg-slate-100 h-1 rounded-2xl">
                        <motion.div className="absolute bg-gradient-to-l from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% h-1   text-sm rounded-2xl w-2/3 top-0 right-0 bottom-0 left-0"
                            initial={{width:"0%"}}
                            animate={{width:`${width}%`}}
                            transition={{duration:1 ,ease:"easeOut"}}
                        >
                        <span className="absolute drop-shadow-lg inset-0 font-semibold text-slate-950 flex items-center justify-center " >
                            {percentage}%
                            </span>  
                        </motion.div>
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-2  text-slate-900">
                    <div className="flex items-center justify-around space-x-1">
                                <div className="flex items-center justify-center gap-1">
                                    <p className="text-sm font-nunito text-gray-900">spent:</p>
                                    <p className="text-sm text-red-800 ">{formatCurrency(convertAmountFromMiliunits(c.amount))}</p>
                                </div>
                                <Rocket className="w-4 h-4 text-red-500" />
                            </div >
                            -
                    <div className="flex items-center space-x-1">
                            <div className="flex items-center justify-center gap-1">
                                <p className="text-sm font-nunito text-gray-900">limit:</p>
                                <p className="text-sm text-yellow-600">{formatCurrency(convertAmountFromMiliunits(c.goal!))}</p>
                                </div>
                            </div>
                            <Goal className="w-4 h-4 text-yellow-500" />
                    </div>
                    </div>
            )
        })
       }
       
    </div>)
}

export default GoalOverview