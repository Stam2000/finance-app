import { useQuery } from "@tanstack/react-query";
import {client} from "@/lib/hono"

export const useGetCategoriesAll = ()=>{

    const query = useQuery({
        queryKey:["categories"],
        queryFn:async()=>{
            const personaId = localStorage.getItem('selectedPersona') || "testData"
            const response = await client.api.categories["all"].$get({},{
                headers: {
                    'X-Persona-ID': personaId,      
                }
            })

            if(!response.ok){
                throw new Error("Failed to fetch categories");
            }

            const {data} = await response.json();
            return data
        }
    })

    return query
}
