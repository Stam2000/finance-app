import { useQuery } from "@tanstack/react-query";
import {client} from "@/lib/hono"

export const useGetCategoriesAllTracking = ()=>{

    const query = useQuery({
        queryKey:["categories",{key:"tracking"}],
        queryFn:async()=>{
            const response = await client.api.categories["tracking"].$get()

            if(!response.ok){
                throw new Error("Failed to fetch categories");
            }

            const {data} = await response.json();
            return data
        }
    })

    return query
}
