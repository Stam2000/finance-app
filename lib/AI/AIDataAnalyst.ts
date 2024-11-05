import {ChatOpenAI} from "@langchain/openai"
import {ChatPromptTemplate,MessagesPlaceholder} from "@langchain/core/prompts"
import {RunnableSequence} from "@langchain/core/runnables"


import {convertToOpenAIFunction} from "@langchain/core/utils/function_calling"
import { AgentExecutor} from "langchain/agents"
import {formatToOpenAIFunctionMessages} from "langchain/agents/format_scratchpad"
import {OpenAIFunctionsAgentOutputParser} from "langchain/agents/openai/output_parser"

import { tools } from "@/lib/functionsAiChat"
import { SystemPrompt } from "@/lib/functionsAiChat"
import {AIMessage,BaseMessage,HumanMessage} from "@langchain/core/messages"
/* import { useState } from "react" */

async function agent(){
    const humanInput = {input:"use"}
    const chatHistory: BaseMessage[] = [];
    console.log(chatHistory)


        const getTodaysDate =()=>{
            const todayDate = new Date()
            return todayDate.toString()
        } 

        console.log(getTodaysDate())

        const model = new ChatOpenAI({
            model:"gpt-4o-mini",
            apiKey:process.env.OPENAI_API_KEY
        })

    

        const MEMORY_KEY = "chat_history";
        const memoryPrompt = ChatPromptTemplate.fromMessages([
            ["system",SystemPrompt],
                        new MessagesPlaceholder(MEMORY_KEY),
            ["user", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
        ]);


        const modelWithFunctions = model.bind({
            functions: tools.map((tool) => convertToOpenAIFunction(tool)),
        });

        const runnableAgent = RunnableSequence.from([
            {
                input: (i) => i.input,
                agent_scratchpad: (i) => formatToOpenAIFunctionMessages(i.steps),
                chat_history: (i) => i.chat_history,
            },
            memoryPrompt,
            modelWithFunctions,
            new OpenAIFunctionsAgentOutputParser(),
        ])



        const executor = AgentExecutor.fromAgentAndTools({
            agent:runnableAgent,
            tools
        });



        const resp = await executor.invoke({
            input:humanInput.input,
            chat_history:chatHistory,
        })

        chatHistory.push(new HumanMessage(humanInput.input))
        chatHistory.push(new AIMessage(resp.output))
        
        
        console.log(chatHistory)



}
