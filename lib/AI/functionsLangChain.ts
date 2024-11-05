import { functions } from "@/lib/AI/functionsAiChat"
import { openAiTools } from "@/lib/AI/functionsAiChat"
import { PromptTemplate } from "@langchain/core/prompts"
import { ChatOpenAI } from "@langchain/openai";
import { handleRunStatus } from "@/lib/AI/functionsAiChat"
import { openai } from "./createAiFunctions"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { MessageCreateParams } from "openai/resources/beta/threads/messages.mjs"
import { AssistantTool } from "openai/resources/beta/assistants.mjs"
import { RunnableSequence } from "@langchain/core/runnables"
import axios from "axios"
import { startOfMonth,startOfYear,format,subWeeks,startOfWeek,endOfWeek,differenceInDays } from "date-fns"
import { convertAmountFormMiliunits, formatCurrency } from "../utils"

const llm = new ChatOpenAI({
    openAIApiKey:"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",
    model: "gpt-4o-mini",
  })

export async function analyseYearData (){
    const SystemPromptAssistant =`Role:You areanAIassistant actingas a personalfinancialanalyst for the user. You have full access to all their financial transactions, including the details of each operation. Your goal is to help the user optimize their personal finances by providing detailed analyses, personalized recommendations, and alternatives to recurring expenses to limit or eliminate unnecessary costs.
    Note: The continuation of the instructions is found in the description of a function named "MoreInformationForTheAssistant".`
    const goals = await fetchGoal()

    console.log(`   ########-------#####################-------------########
                                        ${goals}
                    ########-------#####################-------------########
        `)
    let message:MessageCreateParams = {role:"user",content:`i want you to analyse my finance from the beginning of the Year til the end of the last week all account conbnated. here is an overview of all my goals(spending limit and save goals oder earn goal) per category per month ${goals}`}
    const tool=[{
		type: "function",
		function: {
			name: "fetchTransactions",
			description: "Fetches transaction data for a specified date range and account ID from a local API endpoint. Returns a JSON string of transactions or null if an error occurs.",
			parameters: {
				type: "object",
				properties: {
					from: {
						type: "string",
						description: "Starting date in 'yyyy-mm-dd' format for the transaction range, optional.",
						optional: true
					},
					to: {
						type: "string",
						description: "Ending date in 'yyyy-mm-dd' format for the transaction range, optional.",
						optional: true
					},
					accountId: {
						type: "string",
						description: "Optional ID of the account for which to fetch transactions.",
						optional: true
					}
				},
				required: []
			},
		}
	},{
		type: "function",
		function: {
			name: "MoreInformationForTheAssistant_DON_T_CALL_THIS_FUNCTION",
			description: `Tasks and Responsibilities:
Expense Analysis:Identify the main categories of expenses and trends.Spot unusual or excessive expenditures.
Recommendations:Propose ways to reduce expenses.Suggest less costly alternatives for recurring expenses.Offer advice to optimize the budget.
Alternatives and Solutions:Look for subscriptions or services that can be canceled.Suggest saving or investment options.Propose plans to repay debts efficiently.Communication:
Present information in a clear and structured manner.Use professional and accessible language.Be proactive and empathetic in your advice.
Additional Guidelines:Confidentiality: Strictly respect the confidentiality of the information.Personalization: Adapt your advice based on the user's financial habits and goals.Limits: Do not make decisions on behalf of the user; provide recommendations only.Final Objective:
Help the user better manage their finances by identifying areas where they can save money, optimizing expenses, and planning for the future.`,
			parameters: {},
		}
	}]
    //Create Thread
        const emptyThread = await openai.beta.threads.create()
        const threadId = (emptyThread.id).toString()
       /*  console.log(threadId) */

    //Create assistant 
    const aiAssistant = await openai.beta.assistants.create({
        name:"Financial Analistic Year",
        description:SystemPromptAssistant,
        model:"gpt-4o-mini",
        tools:[...tool,{type:"code_interpreter"}]     
    })

    /* console.log(aiAssistant) */
    //Append Message in the thread
    try{
            const threadMessages = await openai.beta.threads.messages.create(
                threadId!,
                message
            )

            /* console.log(threadMessages) */
        }catch(err){
            console.error(err)
        }

    /* message["content"]=[{"type":"text","text":""}] */

    try{
        let run = await openai.beta.threads.runs.createAndPoll(
        threadId!,
            {
                assistant_id:aiAssistant.id,
                instructions:`all date are calculate from the actual Date ${new Date()}.You get the transactions data by calling the function "fetchTransactions".use much as you can the code interpreter to provide accurate analytics`
            }
        )

  
     const output = await handleRunStatus(run,openai,threadId)
     console.log(` Result analyseYearData ${output}`)
     return output

    }catch(err){
        console.error(err)
       throw new Error()
    }

}

async function agentMonth (
  resultYear:string,
){
    console.log("######################################################################################################################################################################################################")
    const SystemPromptAssistant =`Role:You areanAIassistant actingas a personalfinancialanalyst for the user. You have full access to all their financial transactions, including the details of each operation. Your goal is to help the user optimize their personal finances by providing detailed analyses, personalized recommendations, and alternatives to recurring expenses to limit or eliminate unnecessary costs.
Note: The continuation of the instructions is found in the description of a function named "MoreInformationForTheAssistant".`
        const goals = await fetchGoal()
        let message:MessageCreateParams = {role:"user",content:`i want you to analyse my finance from the beginning of the month til the end of the last week. here is an overview of all my goals(spending limit and save goals oder earn goal) per category per month ${goals} here is the result of the analytic from the start of the year til the end of the last week ${resultYear}`}
        const tool =[{
            type: "function",
            function: {
                name: "fetchTransactions",
                description: "Fetches transaction data for a specified date range and account ID from a local API endpoint. Returns a JSON string of transactions or null if an error occurs.",
                parameters: {
                    type: "object",
                    properties: {
                        from: {
                            type: "string",
                            description: "Starting date in 'yyyy-mm-dd' format for the transaction range, optional.",
                            optional: true
                        },
                        to: {
                            type: "string",
                            description: "Ending date in 'yyyy-mm-dd' format for the transaction range, optional.",
                            optional: true
                        },
                        accountId: {
                            type: "string",
                            description: "Optional ID of the account for which to fetch transactions.",
                            optional: true
                        }
                    },
                    required: []
                },
            }
        },{
            type: "function",
            function: {
                name: "MoreInformationForTheAssistant_DON_T_CALL_THIS_FUNCTION",
                description: `Tasks and Responsibilities:
Expense Analysis:Identify the main categories of expenses and trends.Spot unusual or excessive expenditures.
Recommendations:Propose ways to reduce expenses.Suggest less costly alternatives for recurring expenses.Offer advice to optimize the budget.
Alternatives and Solutions:Look for subscriptions or services that can be canceled.Suggest saving or investment options.Propose plans to repay debts efficiently.Communication:
Present information in a clear and structured manner.Use professional and accessible language.Be proactive and empathetic in your advice.
Additional Guidelines:Confidentiality: Strictly respect the confidentiality of the information.Personalization: Adapt your advice based on the user's financial habits and goals.Limits: Do not make decisions on behalf of the user; provide recommendations only.Final Objective:
Help the user better manage their finances by identifying areas where they can save money, optimizing expenses, and planning for the future.`,
                parameters: {},
            }
        }]
        //Create Thread
            const emptyThread = await openai.beta.threads.create()
            const threadId = emptyThread.id
            /* console.log(threadId) */
    
        //Create assistant 
        const aiAssistant = await openai.beta.assistants.create({
            name:"Financial Analistic Month",
            description:SystemPromptAssistant,
            model:"gpt-4o-mini",
            tools:[...tool,{type:"code_interpreter"}]     
        })
    
       /*  console.log(aiAssistant) */
        //Append Message in the thread
        try{
                const threadMessages = await openai.beta.threads.messages.create(
                    threadId!,
                    message
                )
    
                /* console.log(threadMessages) */
            }catch(err){
                console.error(err)
            }
    
        /* message["content"]=[{"type":"text","text":""}] */
    
        try{
            let run = await openai.beta.threads.runs.createAndPoll(
            threadId!,
                {
                    assistant_id:aiAssistant.id,
                    instructions:`all date are calculate from the actual Date ${new Date()}.You get the transactions data by calling the function "fetchTransactions".use much as you can the code interpreter to provide accurate analytics`
                }
            )
    
      
         const output = await handleRunStatus(run,openai,threadId)
         console.log(` Result agentMonth ${output}`)
         return output
    
        }catch(err){
            console.error(err)
           throw new Error()
        }
    
    }

async function agentWeek ({
    resultMonth,
    resultYear,
    
}:{ resultMonth:string,
    resultYear:string,
    }){
        console.log("######################################################################################################################################################################################################")
        const SystemPromptAssistant =`Role:You areanAIassistant actingas a personalfinancialanalyst for the user. You have full access to all their financial transactions, including the details of each operation. Your goal is to help the user optimize their personal finances by providing detailed analyses, personalized recommendations, and alternatives to recurring expenses to limit or eliminate unnecessary costs.
Note: The continuation of the instructions is found in the description of a function named "MoreInformationForTheAssistant".`
            const goals = await fetchGoal()
            let message:MessageCreateParams = {role:"user",content:`i want you to analyse my finance of the last week. here is an overview of all my goals(spending limit and save goals oder earn goal) per category per month ${goals} here is the result of the analytic from the start of the year til the end of the last week ${resultYear} and from the begining of the month til the end of the last week ${resultMonth}`}
            const tool=[{
                type: "function",
                function: {
                    name: "fetchTransactions",
                    description: "Fetches transaction data for a specified date range and account ID from a local API endpoint. Returns a JSON string of transactions or null if an error occurs.",
                    parameters: {
                        type: "object",
                        properties: {
                            from: {
                                type: "string",
                                description: "Starting date in 'yyyy-mm-dd' format for the transaction range, optional.",
                                optional: true
                            },
                            to: {
                                type: "string",
                                description: "Ending date in 'yyyy-mm-dd' format for the transaction range, optional.",
                                optional: true
                            },
                            accountId: {
                                type: "string",
                                description: "Optional ID of the account for which to fetch transactions.",
                                optional: true
                            }
                        },
                        required: []
                    },
                }
            },{
                type: "function",
                function: {
                    name: "MoreInformationForTheAssistant_DON_T_CALL_THIS_FUNCTION",
                    description: `Tasks and Responsibilities:
Expense Analysis:Identify the main categories of expenses and trends.Spot unusual or excessive expenditures.
Recommendations:Propose ways to reduce expenses.Suggest less costly alternatives for recurring expenses.Offer advice to optimize the budget.
Alternatives and Solutions:Look for subscriptions or services that can be canceled.Suggest saving or investment options.Propose plans to repay debts efficiently.Communication:
Present information in a clear and structured manner.Use professional and accessible language.Be proactive and empathetic in your advice.
Additional Guidelines:Confidentiality: Strictly respect the confidentiality of the information.Personalization: Adapt your advice based on the user's financial habits and goals.Limits: Do not make decisions on behalf of the user; provide recommendations only.Final Objective:
Help the user better manage their finances by identifying areas where they can save money, optimizing expenses, and planning for the future.`,
                    parameters: {},
                }
            }]
            //Create Thread
                const emptyThread = await openai.beta.threads.create()
                const threadId =  (emptyThread.id).toString()
                /* console.log(threadId) */
        
            //Create assistant 
            const aiAssistant = await openai.beta.assistants.create({
                name:"Financial Analistic Week",
                description:SystemPromptAssistant,
                model:"gpt-4o-mini",
                tools:[...tool,{type:"code_interpreter"}]     
            })
        
          /*   console.log(aiAssistant) */
            //Append Message in the thread
            try{
                    const threadMessages = await openai.beta.threads.messages.create(
                        threadId!,
                        message
                    )
        
                   /*  console.log(threadMessages) */
                }catch(err){
                    /* console.error(err) */
                }
        
            /* message["content"]=[{"type":"text","text":""}] */
        
            try{
                let run = await openai.beta.threads.runs.createAndPoll(
                threadId!,
                    {
                        assistant_id:aiAssistant.id,
                        instructions:`all date are calculate from the actual Date ${new Date()}.You get the transactions data by calling the function "fetchTransactions".use much as you can the code interpreter to provide accurate analytics`
                    }
                )
        
          
             const output = await handleRunStatus(run,openai,threadId)
             console.log(` Result agentWeek ${output}`)
             return output
        
            }catch(err){
                console.error(err)
               throw new Error()
            }
        
        }
const fetchGoal = async()=>{
    const res = await axios.get("http://localhost:3000/api/categories/all");
    
    // Log the data to check if it's an array
    /* console.log(res.data.data) */

    if (!Array.isArray(res.data.data)) {
        console.error('Expected an array but got:', typeof res.data);
        return [];
    }

    let categories = res.data.data.filter(category => category.goal !== null && category.goal !== 0);

    const goals = categories.map(category => ({
        name: category.name,
        spendingLimitforEachMonth: formatCurrency(convertAmountFormMiliunits(category.goal)),
    }));
    
   /*  console.log("#####################################################------------------------------------------###########################################")
    console.log(goals)
    console.log("#####################################################------------------------------------------###########################################") */

    return JSON.stringify(goals);
}

export const langChain = async ()=>{

    const monthAnalyticChain = RunnableSequence.from([
        {
            resultYear: prev => prev.resultYear,
        },
        async(prev)=> await agentMonth(prev.resultYear)
    ])

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

        <p style="text-align: center; font-style: italic; color: #6b7280;">
            🤔 Would you like to delve deeper into specific categories or trends, or do you have any other questions regarding your finances?
        </p>
    </div>

"""Render only the JSX inside the <div> element (excluding the imports, function definitions, or export statements).you render should only content the div element without any commment oder added text oder cotation. and don't do any formating in your response !!! because it will be directly render in this div as HTML element <div dangerouslySetInnerHTML={{__html:""YOUR RENDER HERE""}} />"""

text:{input}
answer:`
    const answerPrompt = PromptTemplate.fromTemplate(answerTemplate)
    const answerChain=answerPrompt.pipe(llm).pipe(new StringOutputParser())

    const chain = RunnableSequence.from([
        {
            resultYear:analyseYearData,
        },
        {
            resultYear: prev => prev.resultYear,
            resultMonth:monthAnalyticChain,
        },
        async(prev)=>await agentWeek({resultMonth:prev.resultMonth,resultYear:prev.resultYear}),
        {
            input:prev => JSON.stringify(prev)
        },
        answerChain,
        prev => {/* console.log(`prev result ${prev}`)  */
            return prev }
    ])

    const reducedVersionTemplate =`resume the input you recieve in exactly less than 550 Characters.
            Generate a weekly financial review summary for display in a finance app dashboard. keep it exactly less dann 320 char.
            you will return a normal text with emoji and no Html code the only allowed HTML element is the list element.
            you render should only content the text without any commment oder added text oder cotation. 
            it will be directly render in a div element.Format it concisely for a clean app dashboard view.

Example Output:

            📊 ### Weekly Financial Review /n
            #### Net Savings: €41 💸 /n
            #### Income vs Expenses: Well-balanced 📈 /n

            #### High Expense Area: 📱 Electronics (€133) /n
            #### Controlled Areas: 🍽️ Dining (€34), 🎭 Entertainment (€22) /n


            🔍 ### Recommendations:/n

            Evaluate 📱 Electronics spending /n
            Maintain 🍽️ Dining budget discipline /n
            Build 💰 Savings for emergencies/investments /n

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


