import { useQuery } from "@tanstack/react-query";
import {client} from "@/lib/hono"

export const useGetWeeklyAnalyse = ()=>{

    const query = useQuery({
        queryKey:["conversation",{key:"tracking"}],
        queryFn:async()=>{
            const response = await client.api.conversation["weeklyResume"].$get()

            if(!response.ok){
                throw new Error("Failed to fetch categories");
            }

            const {res,reducedText} = await response.json();
            return {res,reducedText}
        }
    })

    return query
}
