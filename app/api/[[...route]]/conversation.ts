
import OpenAI from "openai"
import { handleRunStatus } from "@/lib/AI/functionsAiChat"
import { functions } from "@/lib/AI/functionsAiChat"
import {Hono} from "hono"
import { openAiTools } from "@/lib/AI/functionsAiChat"
import { openai } from "@/lib/AI/createAiFunctions"
import { GenTemplate } from "@/lib/AI/generateData"
import { langChain } from "@/lib/AI/functionsLangChain"
import { DataGenerator } from "@/lib/AI/generateData"
import { zValidator } from "@hono/zod-validator"


const SystemPrompt =`You are an AI assistant specialized in financial analysis, helping users manage transactions, accounts, and spending patterns.providing personalized financial management advice, and offering insights on budgeting, saving, and expense optimization.Refer to the 'moreInformationsForTheAssistant' function for additional details.`



const conversation = new Hono()
    .post(
    "/",
    async (c)=>{
    let message:{[key:string]:any} = {role:"user"}
     /* const emptyThread = await openai.beta.threads.create(); */ 
     const f = await c.req.formData()
     let threadId = f.get("threadId")!
     console.log(threadId)
     if (threadId===''){
        const emptyThread = await openai.beta.threads.create()
        threadId = emptyThread.id
        console.log(threadId)
     }
     message["content"]=[{"type":"text","text":f.get("question")?.toString()!}]
    
     console.log(f)
     for (let entry of f.entries()) {
       /*  console.log(entry[0] + ': ' + entry[1]); */
        const [key,value] = entry
        /* console.log(value.type + ":" + key) */
        if(key==="file"){
            const [type,extention] = value.type.split("/")
            if (type === "image"){
                // upload it and add it to the message array
               
                    const image = await openai.files.create(
                        {
                            file:value,
                            purpose:"assistants"
                        }
                    )
 
                message["content"].push({
                    "type":"image_file",
                    "image_file":{"file_id":image.id}
                })
            }else{
                // upload it and add it to the attachements
                const file = await openai.files.create(
                    {
                        file:value,
                        purpose:"assistants"
                    }
                )
            /* console.log(message)
            console.log(file) */
            
            if(message.attachements){
                message["attachments"] = [...message.attachments,{
                    file_id:file.id,
                    tools:[{type:"code_interpreter"}]
                    }]
                /* console.log(message) */
            }else{
                 message["attachments"] = [{
                file_id:file.id,
                tools:[{type:"code_interpreter"}]
                }]
                /* console.log(message) */
            }
           
            
            }
        }
    }

    try{
        const threadMessages = await openai.beta.threads.messages.create(
            threadId!,
        message
    )
        /* console.log(threadMessages) */
    }catch(err){
        console.error(err)
    }
    
    

    try{let run = await openai.beta.threads.runs.createAndPoll(
        threadId!,
        {assistant_id:"asst_6igPcJ0zc8Ge3S6Ea2moAIUC",
            instructions:`all date are calculate from the actual Date ${new Date()}`
        }
    )
    console.log(functions)
     const output = await handleRunStatus(run,openai,threadId)
     console.log(output)
     return c.json({response:{output,threadId}},200)
    }catch(err){
        console.error(err)
        return c.text("error",500)
    }

})
.get("/",async(c)=>{
    console.log(c.req)
    
        const aiAssistant = await openai.beta.assistants.create({
       name:"Financial Assistant",
        description:SystemPrompt,
        model:"gpt-4o-mini",
        tools:[...openAiTools,{type:"code_interpreter"}]
         
    })
    /* console.log(aiAssistant.id) */
    return c.json({aiAssistant:aiAssistant})
})
.get("/weeklyResume",async(c)=>{
    try{
    /* const {resume,reducedText} = await langChain() */
    return c.json({res:"resume",reducedText:"yes"})
    }catch(err){
        console.log(err)
    }
    
})
.get("/sampleDataChat",async(c)=>{
    try {
        // Call your utility function
        const response = await GenTemplate();
      
        // Log the response from GenNewLg
        console.log('Response from GenNewLg:', response);
    
        // Return the JSON response
        return c.json({data:response})

      } catch (error) {
        // Log the error for debugging
        console.error('Error in POST /api/ai:', error);
    
        //TODO return the error when something don't work
      }
})
.post("/",zValidator("json",
    insertdetailsTransactionsSchema.omit({id:true})
),
async(c)=> {
    try{
    const auth= {userId:"testData"}
    const data = c.req.valid("json")
      
        // Call your utility function
        const response = await DataGenerator(data);
        // Log the response from GenNewLg
        console.log('Response from GenNewLg:', response);
    
        // Return the JSON response
        return c.json({data})

      } catch (error) {
        // Log the error for debugging
        console.error('Error in POST /api/ai:', error);
        // Return a 500 Internal Server Error response
      }
    
})

export default conversation

