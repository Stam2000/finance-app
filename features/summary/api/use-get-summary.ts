
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { convertAmountFormMiliunits } from "@/lib/utils";
import {client} from "@/lib/hono"


export const useGetSummary = () =>{

   const params = useSearchParams()
    const from = params.get("from")||""
    const to = params.get("to")||""
    const accountId = params.get("accountId")||"";

    
    const query = useQuery({
        queryKey:["summary",{from,to,accountId}],
        queryFn : async () =>{
            const personaId = localStorage.getItem('selectedPersona') || "testData"

            const response = await client.api.summary.$get({
                query:
                {from,
                to,
                accountId}
            },{
                headers: {
                    'X-Persona-ID': personaId,      
                }
            })

            if(!response.ok){
                throw new Error("Failed to fetch summary")
            }

            const {data} = await response.json()
            
            return{
                ...data,
                incomeAmount: convertAmountFormMiliunits(data.incomeAmount),
                expensesAmount: convertAmountFormMiliunits(data.expensesAmount),
                remainingAmount: convertAmountFormMiliunits(data.remainingAmount),
                categories: data.categories.map((category)=>({
                    ...category,
                    value:convertAmountFormMiliunits(category.value),
                })),
                days:data.days.map((day)=>({
                    ...day,
                    income:convertAmountFormMiliunits(day.income),
                    expenses:convertAmountFormMiliunits(day.expenses)
                }))
            }
        }
    })

    return query;
};
