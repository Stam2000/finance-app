import { PromptTemplate } from "@langchain/core/prompts"
import { ChatOpenAI } from "@langchain/openai";
import { handleRunStatus } from "@/lib/AI/functionsAiChat"
import { openai } from "./createAiFunctions"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { MessageCreateParams } from "openai/resources/beta/threads/messages.mjs"
import { RunnableSequence,RunnableLike } from "@langchain/core/runnables"
import axios from "axios"
import { AssistantTool } from "openai/resources/beta/assistants.mjs";
import { convertAmountFormMiliunits, formatCurrency } from "../utils"

const llm:RunnableLike = new ChatOpenAI({
    openAIApiKey:"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",
    model: "gpt-4o-mini",
  })


async function agentWeek (personaId:string,personaDes:string){

    let threadId:string=""
    try {
        // Fetch goals and validate
        const goals = await fetchGoal(personaId);
        if (!goals) {
            throw new Error("Failed to fetch goals. Please check the personaId or the fetchGoal function.");
        }
    
        // Prepare the message
        const mesg: MessageCreateParams = {
            role: "user",
            content: ` analyze the finance of this user for  last week. Here is an overview of all his/her goals (spending limit, save goals, or earn goal) per category per month: ${JSON.stringify(goals)}. But begin analyzing my transactions from the start of the month so that for my weekly analysis you can find relevant patterns. The date of today is ${new Date().toISOString()}. full user description ${personaDes}`
        };
    
        // Create an empty thread
        const emptyThread = await openai.beta.threads.create();
        if (!emptyThread || !emptyThread.id) {
            throw new Error("Failed to create a new thread. Please check the OpenAI API response.");
        }
        threadId = emptyThread.id.toString();
    
        // Append message in the thread
        try {
            const threadMessages = await openai.beta.threads.messages.create(threadId, mesg);
            console.log("Message appended successfully:", threadMessages);
        } catch (err:any) {
            console.error("Error while creating a message in the thread:", err);
            throw new Error(`Failed to append the message in thread ${threadId}: ${err.message}`);
        }
    } catch (error:any) {
        console.error("Error in financial analysis flow:", error);
        // Optionally rethrow or handle based on your application's requirements
        throw new Error(`Financial analysis failed: ${error.message}`);
    }
        
            /* message["content"]=[{"type":"text","text":""}] */
        
            try{
                let run = await openai.beta.threads.runs.createAndPoll(
                threadId,
                    {
                        assistant_id:"asst_boZOZzFC88YlRkN7eGmPgRSX",
                        instructions:`all date are calculate from the actual Date ${new Date()}.You get the transactions data by calling the function "fetchTransactions".use much as you can the code interpreter to provide accurate analytics  `
                    }
                )
        
          
             const output = await handleRunStatus(run,openai,threadId,personaId)
             console.log(` Result agentWeek ${output}`)
             return output
        
            }catch(err){
                console.error(err)
               throw new Error()
            }
        
        }
const fetchGoal = async(personaId:string)=>{
    const res = await axios.get("http://localhost:3000/api/categories/all",{
        headers: {
            'X-Persona-ID': personaId,  
          }
     });
    

    if (!Array.isArray(res.data.data)) {
        console.error('Expected an array but got:', typeof res.data);
        return [];
    }

    let categories:any = res.data.data.filter((category:any) => category.goal !== null && category.goal !== 0);

    const goals = categories.map((category:any) => ({
        name: category.name,
        spendingLimitforEachMonth: formatCurrency(convertAmountFormMiliunits(category.goal)),
    }));
    

    return JSON.stringify(goals);
}

export const langChain = async (personaId:string,personaDes:string)=>{


const answerTemplate=`your role is to provide a more friendly formating of text(which represents a finance analysis).
i want you inspiration this layout.the content can change .Make sure all the informations you receive are represented. 

    follow exactly this layout with the exact css attribute

      <div style="display: flex; flex-direction: column; gap: 20px; max-width: 1200px; margin: 0 auto;">
        <div style="display: flex; flex-wrap: wrap; gap: 20px;">
            <div style="flex: 1; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; min-width: 200px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="font-size: 14px; margin: 0;">Total Income</h3>
                    <span style="font-size: 24px;">📈</span>
                </div>
                <div style="font-size: 24px; font-weight: bold; color: #22c55e;">€350</div>
            </div>
            <div style="flex: 1; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; min-width: 200px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="font-size: 14px; margin: 0;">Total Expenses</h3>
                    <span style="font-size: 24px;">📉</span>
                </div>
                <div style="font-size: 24px; font-weight: bold; color: #ef4444;">€210</div>
            </div>
            <div style="flex: 1; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; min-width: 200px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="font-size: 14px; margin: 0;">Savings</h3>
                    <span style="font-size: 24px;">💸</span>
                </div>
                <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">€140</div>
            </div>
        </div>

        <div style="background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px;">
            <h3 style="font-size: 18px; margin-bottom: 15px;">💳 Expenses by Category</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f3f4f6;">
                            <th style="padding: 10px; text-align: left;">Category</th>
                            <th style="padding: 10px; text-align: right;">Amount (€)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-top: 1px solid #e5e7eb;">
                            <td style="padding: 10px;">🖥️ Electronics</td>
                            <td style="padding: 10px; text-align: right;">55</td>
                        </tr>
                        <tr style="border-top: 1px solid #e5e7eb;">
                            <td style="padding: 10px;">🎭 Entertainment</td>
                            <td style="padding: 10px; text-align: right;">22</td>
                        </tr>
                        <tr style="border-top: 1px solid #e5e7eb;">
                            <td style="padding: 10px;">🏥 Health</td>
                            <td style="padding: 10px; text-align: right;">25</td>
                        </tr>
                        <tr style="border-top: 1px solid #e5e7eb;">
                            <td style="padding: 10px;">🏠 Household Items</td>
                            <td style="padding: 10px; text-align: right;">68</td>
                        </tr>
                        <tr style="border-top: 1px solid #e5e7eb;">
                            <td style="padding: 10px;">✈️ Travel</td>
                            <td style="padding: 10px; text-align: right;">40</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div style="background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px;">
            <h3 style="font-size: 18px; margin-bottom: 15px; display: flex; align-items: center;">
                <span style="font-size: 24px; margin-right: 10px;">🧠</span>
                Analysis Insights
            </h3>
            <ul style="padding-left: 20px; margin: 0;">
                <li style="margin-bottom: 10px;">Income significantly outweighed expenses, resulting in healthy savings of €140.</li>
                <li style="margin-bottom: 10px;">🏠 Household Items contributed the most to spending at €68.</li>
                <li style="margin-bottom: 10px;">🖥️ Electronics and ✈️ Travel accounted for notable expenses at €55 and €40 respectively.</li>
                <li style="margin-bottom: 10px;">🎭 Entertainment spending was relatively low at €22, indicating good control in this category.</li>
            </ul>
        </div>

        <div style="background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px;">
            <h3 style="font-size: 18px; margin-bottom: 15px; display: flex; align-items: center;">
                <span style="font-size: 24px; margin-right: 10px;">📈</span>
                Recommendations
            </h3>
            <ul style="padding-left: 20px; margin: 0;">
                <li style="margin-bottom: 10px;">Continue maintaining the positive savings rate of €140.</li>
                <li style="margin-bottom: 10px;">Review 🏠 Household Items spending and evaluate necessity of purchases.</li>
                <li style="margin-bottom: 10px;">Consider setting budget limits for categories like 🏥 Health and 🖥️ Electronics.</li>
            </ul>
        </div>
    </div>

"""Render only the JSX inside the <div> element (excluding the imports, function definitions, or export statements).you render should only content the div element without any commment oder added text oder cotation. and don't do any formating in your response !!! because it will be directly render in this div as HTML element <div dangerouslySetInnerHTML={{__html:""YOUR RENDER HERE""}} />"""

text:{input}
answer:`
    const answerPrompt = PromptTemplate.fromTemplate(answerTemplate)
    const answerChain=answerPrompt.pipe(llm).pipe(new StringOutputParser())

    const chain = RunnableSequence.from([
        async(prev)=>await agentWeek(personaId,personaDes),
        {
            input:prev => JSON.stringify(prev)
        },
        answerChain,
        new StringOutputParser ()
    ])

    const reducedVersionTemplate =`resume the input you recieve in exactly less than 550 Characters.
            Generate a weekly financial review summary for display in a finance app dashboard. keep it exactly less dann 320 char.
            
            you render must only content the output without any commment oder added text oder cotation. 

            exemple output : <div>
  <h1 style="font-weight: bold; font-size: 1.125rem; padding-bottom: 0.5rem;">📊Weekly Financial Review</h1>
  <div style="padding-bottom: 1rem;">
    <ul>
      <li><span style="font-weight: 500;">Net Savings:</span> <span style="text-decoration: underline; text-decoration-thickness: 2px;">＄616</span> 💸</li>
      <li><span style="font-weight: 500;">Income vs Expenses:</span> Well-balanced 📈</li>
      <li><span style="font-weight: 500;">High Expense Area:</span>📚 Education <span style="text-decoration: underline; text-decoration-thickness: 2px;">＄155</span></li>
      <li><span style="font-weight: 500;">Controlled Areas:</span>🛒 Groceries <span style="text-decoration: underline; text-decoration-thickness: 2px;">＄63</span>, 🍽️ Dining <span style="text-decoration: underline; text-decoration-thickness: 2px;">＄34</span></li>
    </ul>
  </div>

  <div style="padding-bottom: 0.5rem;">
    <div style="display: flex; justify-content: flex-start; align-items: center; gap: 0.25rem; padding-bottom: 0.5rem;">
      🔍<h3 style="font-weight: bold;">Recommendations:</h3>
    </div>
    <ul>
      <li>Maximize freelance income 💼</li>
      <li>Monitor grocery spending 🛒</li>
      <li>Invest savings for future growth 💰</li>
    </ul>
  </div>
</div>

            you can create a html list if need. text:{input} 
            answer:`

    const reducedVersionPrompt = PromptTemplate.fromTemplate(reducedVersionTemplate)

    const reducedVersionChain = reducedVersionPrompt.pipe(llm).pipe(new StringOutputParser())

    const resume = await chain.invoke({})
    const reducedText = await reducedVersionChain.invoke({input:resume})
    console.log(`his is the final result in reduced text 
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                            ${reducedText}
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++`)
    console.log(`this is the final result in the LANGCHAIN 
-----------------------------------------------------------------------
                            ${resume}
-----------------------------------------------------------------------
`)
    return {resume,reducedText}
}


