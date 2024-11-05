import {z} from "zod"
import React from "react"
import { insertdetailsTransactionsSchema,detailsTransactions as detailsTransactionSchema } from "@/db/schema"
import { Dialog,
        DialogContent,
        DialogDescription,
        DialogFooter,
        DialogHeader,
        DialogTitle 
    } from "@/components/ui/dialog2"
import { useGetTransaction } from "@/features/transactions/api/use-get-transaction"
import { useDeleteTransaction } from "@/features/transactions/api/use-delete-transaction"

import { Button } from "@/components/ui/button"
import { formatText } from "@/lib/utils"
import { useGetWeeklyAnalyse } from "@/features/chat/hook/useGetWeekSummary"
import { useOpenWeeKOverview } from "../hook/use-open-weekOverview" 



export const OverviewWeekFinanceDialog =()=>{

    const {isOpen,onClose} = useOpenWeeKOverview()
    const weekQuery = useGetWeeklyAnalyse()
    let weekResume = weekQuery.data?.res||[]

    weekResume=`<div style="display: flex; flex-direction: column; gap: 20px; max-width: 1200px; margin: 0 auto;">
        <div style="display: flex; flex-wrap: wrap; gap: 20px;">
            <div style="flex: 1; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; min-width: 200px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">   
                    <h3 style="font-size: 14px; margin: 0;">Total Income</h3>
                    <span style="font-size: 24px;">📈</span>
                </div>
                <div style="font-size: 24px; font-weight: bold; color: #22c55e;">$835</div>
            </div>
            <div style="flex: 1; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; min-width: 200px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">   
                    <h3 style="font-size: 14px; margin: 0;">Total Expenses</h3>
                    <span style="font-size: 24px;">📉</span>
                </div>
                <div style="font-size: 24px; font-weight: bold; color: #ef4444;">$219</div>
            </div>
            <div style="flex: 1; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; min-width: 200px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">   
                    <h3 style="font-size: 14px; margin: 0;">Net Balance</h3>
                    <span style="font-size: 24px;">💰</span>
                </div>
                <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">$616</div>
            </div>
        </div>

        <div style="background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px;"> 
            <h3 style="font-size: 18px; margin-bottom: 15px;">🗂️ Summary of Transactions</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f3f4f6;">
                            <th style="padding: 10px; text-align: left;">Category</th>
                            <th style="padding: 10px; text-align: right;">Total Amount ($)</th>
                            <th style="padding: 10px; text-align: left;">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-top: 1px solid #e5e7eb;">
                            <td style="padding: 10px;">🏥 Health</td>
                            <td style="padding: 10px; text-align: right;">-45</td>
                            <td style="padding: 10px;">Membership fee for cycling club</td>
                        </tr>
                        <tr style="border-top: 1px solid #e5e7eb;">
                            <td style="padding: 10px;">🛒 Groceries</td>
                            <td style="padding: 10px; text-align: right;">-63</td>
                            <td style="padding: 10px;">Weekly shopping for organic produce</td>
                        </tr>
                        <tr style="border-top: 1px solid #e5e7eb;">
                            <td style="padding: 10px;">⚡ Utilities</td>
                            <td style="padding: 10px; text-align: right;">150</td>
                            <td style="padding: 10px;">Payments for services</td>
                        </tr>
                        <tr style="border-top: 1px solid #e5e7eb;">
                            <td style="padding: 10px;">📚 Education</td>
                            <td style="padding: 10px; text-align: right;">155</td>
                            <td style="padding: 10px;">Payment for educational expenses</td>
                        </tr>
                        <tr style="border-top: 1px solid #e5e7eb;">
                            <td style="padding: 10px;">💼 Freelance</td>
                            <td style="padding: 10px; text-align: right;">480</td>
                            <td style="padding: 10px;">Earnings from a design project</td>
                        </tr>
                        <tr style="border-top: 1px solid #e5e7eb;">
                            <td style="padding: 10px;">🎉 Entertainment</td>
                            <td style="padding: 10px; text-align: right;">-27</td>
                            <td style="padding: 10px;">Subscription fee for book club</td>
                        </tr>
                        <tr style="border-top: 1px solid #e5e7eb;">
                            <td style="padding: 10px;">🍽️ Dining</td>
                            <td style="padding: 10px; text-align: right;">-34</td>
                            <td style="padding: 10px;">Dinner at a farm-to-table restaurant</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div style="background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px;"> 
            <h3 style="font-size: 18px; margin-bottom: 15px; display: flex; align-items: center;">
                <span style="font-size: 24px; margin-right: 10px;">📊</span>
                Analysis Insights
            </h3>
            <ul style="padding-left: 20px; margin: 0;">
                <li style="margin-bottom: 10px;">Freelance earnings are substantial, contributing significantly to overall income.</li>
                <li style="margin-bottom: 10px;">Total expenses are relatively low at $219, permitting a healthy net balance.</li>
                <li style="margin-bottom: 10px;">Utility payments are a positive aspect, exhibiting effective financial management.</li>
            </ul>
        </div>

        <div style="background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px;"> 
            <h3 style="font-size: 18px; margin-bottom: 15px; display: flex; align-items: center;">
                <span style="font-size: 24px; margin-right: 10px;">💡</span>
                Recommendations
            </h3>
            <ul style="padding-left: 20px; margin: 0;">
                <li style="margin-bottom: 10px;">Continue freelancing to maintain high earnings; consider seeking more projects.</li>
                <li style="margin-bottom: 10px;">Monitor health and grocery spending for potential savings.</li>
                <li style="margin-bottom: 10px;">Allocate part of your positive net balance of $616 towards savings or investments.</li>
            </ul>
        </div>

        <p style="text-align: center; font-style: italic; color: #6b7280;">
            🤔 If you require further analysis or more detailed recommendations on specific categories or spending trends, feel free to ask!
        </p>
    </div>`

    weekResume=formatText(weekResume)

    return(
        <Dialog   open={isOpen}  onOpenChange={onClose} >
            <DialogContent className="rounded-2xl" >
                <DialogHeader>
                    <DialogTitle>
                        Overview Transaction
                    </DialogTitle>
                    <DialogDescription>
                        Overview of the transaction a new transaction to transaction
                    </DialogDescription>
                </DialogHeader>
                    <div>
                    <div className="flex flex-col align-center justify-center p-4" dangerouslySetInnerHTML={{__html:weekResume}} />
                    </div>
                <DialogFooter>
                    <Button onClick={onClose}>
                        Back
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
   
}