import { useQuery } from "@tanstack/react-query";
import {client} from "@/lib/hono"



export const useGetAccounts = ()=>{


    const query = useQuery({
        queryKey:["accounts"],
        queryFn:async()=>{
            const personaId = localStorage.getItem('selectedPersona') || "testData"
            
            const response = await client.api.accounts.$get({},{
                headers: {
                    'X-Persona-ID': personaId,      
                }
            })

            if(!response.ok){
                throw new Error("Failed to fetch accounts");
            }

            
            const {data} = await response.json();
            console.log(data)
            return data
        }
    })

    return query
}
