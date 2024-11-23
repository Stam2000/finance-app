"use client"
import { useQuery } from "@tanstack/react-query";
import {client} from "@/lib/hono"
import { useSearchParams } from "next/navigation";
import { convertAmountFormMiliunits } from "@/lib/utils";


export const useGetTransactions = ()=> {
    
    
    const params = useSearchParams()
    const from = params.get("from") || ""

    const to = params.get("to")|| ""
    const accountId = params.get("accountId")||""
    const personaId = localStorage.getItem('selectedPersona') || "testData"
    
    const query = useQuery({
        queryKey:["transactions",{from,to,accountId}],
        queryFn:async()=>{
            const response = await client.api.transactions.$get({
                query:{
                    from,
                    to,
                    accountId
                }, 
            },{
                headers: {
                    // Add persona ID to request headers
                    'X-Persona-ID': personaId,
                    // You can add other persona-related headers if needed
                    
                }
            })

            if(!response.ok){
                throw new Error("Failed to fetch transactions");
            }

            const {data} = await response.json();


            return data.map((transaction)=>({
                ...transaction,
            }))
        }
    })

    return query
}
