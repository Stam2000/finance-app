import {Hono} from "hono"
import fetch from "node-fetch"
import axios from "axios"

const app = new Hono()
    .get("/",
        async(c)=>{

        try{
            const res = await axios.get('https://api.ipify.org?format=json')
            const data = await res.data
            return c.json(data)

        }catch(error:any){
            console.error('Error occurred while fetching IP:', error);
            return c.text(`Error: ${error}`, 500);
        }

    })

export default app