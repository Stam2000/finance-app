import { toast } from "sonner";
import {z} from "zod"
import {client} from "@/lib/hono"
import { InferResponseType,InferRequestType } from "hono";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useGetCategories } from "@/features/categories/api/use-get-categories";

type detailsTransactionsRequest =InferRequestType<typeof client.api.detailsTransactions["$post"]>["json"]
type TransactionResponse = InferResponseType<typeof client.api.transactions["$post"]>
type BaseTransactionRequest = InferRequestType<typeof client.api.transactions["$post"]>["json"]
type TransactionRequest = (BaseTransactionRequest & ({
    detailsTransactions?: detailsTransactionsRequest[]
    })
)[][]

export const json = [
    [
        {
            "accountId": "commerzbank",
            "amount": -150000,
            "payee": "Berlin Apartments GmbH",
            "date": "2024-04-08T10:00:00Z",
            "notes": "Monthly rent payment",
            "categoryId": "housing",
            "detailsTransactions": []
        },
        {
            "accountId": "paypal",
            "amount": -35000,
            "payee": "Café Kultur",
            "date": "2024-04-09T16:30:00Z",
            "notes": "Catching up with friends",
            "categoryId": "dining",
            "detailsTransactions": [
                {
                    "amount": 20000,
                    "name": "Latte Macchiato",
                    "categoryId": "drink",
                    "quantity": 4,
                    "unitPrice": 5000
                },
                {
                    "amount": 15000,
                    "name": "Cheesecake Slice",
                    "categoryId": "food",
                    "quantity": 3,
                    "unitPrice": 5000
                }
            ]
        },
        {
            "accountId": "revolut",
            "amount": -70000,
            "payee": "Zalando",
            "date": "2024-04-11T13:00:00Z",
            "notes": "Spring wardrobe refresh",
            "categoryId": "clothing",
            "detailsTransactions": [
                {
                    "amount": 25000,
                    "name": "T-shirt",
                    "categoryId": "clothing",
                    "quantity": 2,
                    "unitPrice": 12500
                },
                {
                    "amount": 45000,
                    "name": "Jeans",
                    "categoryId": "clothing",
                    "quantity": 1,
                    "unitPrice": 45000
                }
            ]
        },
        {
            "accountId": "n26",
            "amount": 300000,
            "payee": "N26 Savings Account",
            "date": "2024-04-12T09:00:00Z",
            "notes": "Monthly savings transfer",
            "categoryId": "savings",
            "detailsTransactions": []
        },
        {
            "accountId": "paypal",
            "amount": -45000,
            "payee": "FitStar Gym Berlin",
            "date": "2024-04-13T11:00:00Z",
            "notes": "Monthly gym membership fee",
            "categoryId": "health",
            "detailsTransactions": []
        },
        {
            "accountId": "commerzbank",
            "amount": -90000, 
            "payee": "Amazon.de",
            "date": "2024-04-14T19:00:00Z",
            "notes": "Smart Home Accessories",
            "categoryId": "electronics",
            "detailsTransactions": [
                {
                    "amount": 30000,
                    "name": "Smart Bulb",
                    "categoryId": "electronics",
                    "quantity": 2,
                    "unitPrice": 15000
                },
                {
                    "amount": 60000,
                    "name": "Smart Plug",
                    "categoryId": "electronics",
                    "quantity": 3,
                    "unitPrice": 20000
                }
            ]
        }
    ]
]

export const useBulkCreateTAndDfromJson =()=>{

    const {data:accounts} = useGetAccounts()
    const {data:categories}= useGetCategories()
    let allCategories:any = categories || []
    let allAccounts = accounts || []
    let result:any =[]
    const queryClient = useQueryClient()
    const mutation =useMutation
    <TransactionRequest,
        Error,
        TransactionResponse
    >({
        mutationFn:async(json:any)=>{

        
      
        for(const TransactionSet of json){
            for(const transaction of TransactionSet){
            
                const detailsTransactions = transaction.detailsTransactions
                delete transaction["detailsTransactions"]
                const foundCategory = allCategories.find((category:any)=> category.name === transaction.categoryId)
                if(!foundCategory){
            const resCreateCategory = await client.api.categories.$post({json:{name:transaction!.categoryId}})
            const resCategoryData =await resCreateCategory.json()
            if("data" in resCategoryData){
                const CategoryData = resCategoryData.data
                transaction.categoryId = CategoryData.id
                allCategories = [...allCategories,CategoryData]
            }
            }else{
                    transaction.categoryId = foundCategory!.id
            }
                const foundAccount = allAccounts.find((account)=> account.name === transaction.accountId)
                if(!foundAccount){
                const resCreateAccount = await client.api.accounts.$post({json:{name:transaction!.accountId}})
                const resAccountData =await resCreateAccount.json()
                if("data" in resAccountData){
                    const AccountData = resAccountData.data
                    transaction.accountId = AccountData.id
                    allAccounts = [...allAccounts,AccountData]
                }
                }else{
                    transaction.accountId = foundAccount!.id
                }

                            
                const responseTransaction = await client.api.transactions.$post({json:transaction})
                const {data} = await responseTransaction.json()
                result = [...result,data]

      
                if(detailsTransactions?.length !== 0){
                    for(const detail of detailsTransactions!){

                    const foundCategory = allCategories.find((category:any)=> category.name === detail.categoryId)
                    if(!foundCategory){
                        const resCreateCategory = await client.api.categories.$post({json:{name:detail!.categoryId}})
                        const resCategoryData =await resCreateCategory.json()
                        if("data" in resCategoryData){
                                const CategoryData = resCategoryData.data
                            detail.categoryId = CategoryData.id
                            allCategories = [...allCategories,CategoryData]
                        }
                    }else{
                        detail.categoryId = foundCategory!.id
                    }
                    detail["transactionId"]= data.id

                    const responseDetail = await client.api.detailsTransactions.$post({json:detail})
                }}
                    
                }
            }

            return result
        },
        onSuccess:()=>{
            toast.success("Transactions created")
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError:(error)=>{
            toast.error(`Failed to create details: ${error.message}`)
        }
    })

    
    return mutation

}

