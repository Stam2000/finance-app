import { useQuery } from "@tanstack/react-query";
import {client} from "@/lib/hono"
import { useSearchParams } from "next/navigation";
import { convertAmountFormMiliunits } from "@/lib/utils";

export const useGetTransactions = ()=>{
    
    const params = useSearchParams()
    console.log(params)
    const from = params.get("from") || ""
    const to = params.get("to")|| ""
    const accountId = params.get("accountId")||""


    const query = useQuery({
        queryKey:["transactions",{from,to,accountId}],
        queryFn:async()=>{
            const response = await client.api.transactions.$get({
                query:{
                    from,
                    to,
                    accountId
                }
            })

            if(!response.ok){
                throw new Error("Failed to fetch transactions");
            }

            const {data} = await response.json();

            console.log(data)
            return data.map((transaction)=>({
                ...transaction,
            }))
        }
    })

    return query
}
