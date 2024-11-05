import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { projects } from "@/db/schema";
import {createId} from "@paralleldrive/cuid2"
import { zValidator } from "@hono/zod-validator";
import { clerkMiddleware,getAuth } from "@hono/clerk-auth";
import { and,eq,inArray } from "drizzle-orm";
import { sum,desc } from "drizzle-orm";
import { insertProjectSchema } from "@/db/schema";
import { insertTransactionSchema } from "@/db/schema";
import {z} from "zod"
import { convertAmountFormMiliunits } from "@/lib/utils";
import { transactions,detailsTransactions,accounts,categories } from "@/db/schema";


const app = new Hono()
    .get("/",zValidator("query",z.object({
        accountId:z.string().optional()
    })),async (c)=>{

        const {accountId} = c.req.valid("query")
        const auth = {userId:"testData"}
        

    const Projectsdata = await db.select({
        id:projects.id,
        name:projects.name,
        projects:projects.description,
        budget:projects.budget,
        spent:sum(transactions.amount).mapWith(Number)
    }).from(projects).where(eq(projects.userId,auth?.userId))
    .leftJoin(transactions, eq(projects.id, transactions.projectId))
    .groupBy(projects.id,projects.name)

    let transactionsData =[]
    let detailsForTransactions=[]
    let detailsProjects=[]
    if(Projectsdata.length > 0){
        const projectsId = Projectsdata.map(t=>t.id)
            transactionsData =  await db.select({
                id: transactions.id,
                amount: transactions.amount,
                account:accounts.name,
                category:categories.name,
                payee: transactions.payee,
                notes: transactions.notes,
                date: transactions.date,
                projectId:transactions.projectId,
                accountId: transactions.accountId,
                categoryId: transactions.categoryId,
             }).from(transactions)
            .innerJoin(accounts,eq(transactions.accountId,accounts.id))
            .leftJoin(categories,eq(transactions.categoryId,categories.id))
            .where(and( accountId ? eq(transactions.accountId,accountId):undefined,
                inArray(transactions.projectId,projectsId),
                eq(accounts.userId,auth.userId)))
               .orderBy(desc(transactions.date)
            )

    let details =[]
    if(transactionsData.length > 0){
        const transactionsId = transactionsData.map(t=>t.id)
            details = await db.select({
            id: detailsTransactions.id,
            name: detailsTransactions.name,
            quantity: detailsTransactions.quantity,
            unitPrice: detailsTransactions.unitPrice,
            amount: detailsTransactions.amount,
            transactionId: detailsTransactions.transactionId
        })
            .from(detailsTransactions)
            .leftJoin(categories,eq(detailsTransactions.categoryId,categories.id))
            .where(inArray(detailsTransactions.transactionId,transactionsId))
    }
    
        
           detailsForTransactions = details.map(detail=>({
                ...detail,
                amount:convertAmountFormMiliunits(detail.amount),
                unitPrice:convertAmountFormMiliunits(detail.unitPrice)
            }))

            transactionsData = transactionsData.map(transaction=>({
                ...transaction,
                amount:convertAmountFormMiliunits(transaction.amount),
                detailsTransactions: detailsForTransactions.filter(d => d.transactionId === transaction.id)
            }))
    
        
            detailsProjects = await db.select({
            id: detailsTransactions.id,
            name: detailsTransactions.name,
            quantity: detailsTransactions.quantity,
            unitPrice: detailsTransactions.unitPrice,
            amount: detailsTransactions.amount,
            transactionId: detailsTransactions.transactionId
        })
            .from(detailsTransactions)
            .leftJoin(projects, eq(detailsTransactions.projectId, projects.id)) 
            .leftJoin(categories,eq(detailsTransactions.categoryId,categories.id))
            .where(eq(detailsTransactions.projectId,projects.id) )
    }

        const data = Projectsdata.map(project=>({
            ...project,
            project:convertAmountFormMiliunits(project.budget),
            transactions: transactionsData.filter(d => d.projectId === project.id),
            detailsTransactions: detailsProjects.filter(d => d.projectId === project.id),
        }))



    return c.json({data})
})
    .get("/:id",
        zValidator("param",z.object(
            {id:z.string().optional()}
        )),
        async(c)=>{
            const auth = {userId:"testData"}
            const {id}= c.req.valid("param")

            if(!auth?.userId){
                return c.json({error:"Unauthorized"},401)
            }

            let [data] = await db.select({
                id:projects.id,
                name:projects.name,
                description:projects.description,
                budget:projects.budget,
                startDate:projects.startDate,
                endDate:projects.endDate
            }).from(projects).where(
                and(
                  eq(projects.userId,auth.userId),
                  eq(projects.id,id!)  
                ),
            );

            if(!data){
                return c.json({
                    error:"Not found"
                },404)
            }
            
            data = {
                ...data,
                budget:convertAmountFormMiliunits(data.budget)
            }
            return c.json({data})
        }
    )
    .post("/",
        zValidator("json",z.object({
            name: z.string().min(1, "Name is required"), // name is a required string
            description: z.string().optional(), // description can be an optional string
            budget: z.number().nonnegative(), // budget is a non-negative number
            startDate: z.string(), // startDate must be a Date object
            endDate: z.string(),   // endDate must be a Date object
          })),
        async (c)=>{
            const auth = {userId:"testData"}
            const values = c.req.valid("json")
            console.log(values)

            const [data] = await db.insert(projects).values({
                id:createId(),
                userId:auth.userId,
               ...values,
               startDate: new Date(values.startDate!),
               endDate: new Date(values.endDate!)
            }).returning()

            return c.json({data})
        }
    )
    .post("/bulk-delete",
        zValidator("json",z.object({
            ids:z.array(z.string())
        })),
        async (c)=>{
            const auth = {userId:"testData"}
            const values = c.req.valid("json")
            console.log(values)

            if(!auth?.userId){
                return c.json({error:"Unauthorized"},401)
            }

            const data = await db.delete(projects).where(
                and(
                    eq(projects.userId,auth.userId),
                    inArray(projects.id,values.ids)
                )
            ).returning({
                id:projects.id,
            });



            return c.json({data})
        }
    )
    .patch("/:id",
        zValidator("param",
            z.object({
                id:z.string().optional(),
            })
        ),
        zValidator("json",insertProjectSchema.pick({
            name:true,
            description:true,
            budget:true
        })) ,async (c)=>{
            const auth = {userId:"testData"}
            const {id} = c.req.valid("param")
            const values = c.req.valid("json")

            if(!auth?.userId){
                return c.json({error:"Unauthorized"},401)
            }

            if(!id){
                return c.json({error:"Id not found"},400)
            }

            const [data] = await db
                .update(projects)
                .set(values)
                .where(
                    and(
                        eq(projects.userId,auth.userId),
                        eq(projects.id,id)
                    ),
                ).returning()

            if(!data){
                return c.json({error:"Not found"},404)
            }

            return c.json({data})
        })
    .delete("/:id",
        zValidator("param",
            z.object({
                id:z.string().optional(),
            }),
        ),
        async(c)=>{
            const auth = {userId:"testData"}
            const {id} = c.req.valid("param")
            
            if(!id){
            return c.json({
                error:"Missing id"
            },400)

            
        }


            const [data] = await db
                .delete(projects).where(
                    and(
                        eq(projects.userId,auth.userId),
                        eq(projects.id,id)
                    )
                ).returning()

                return c.json({data})
        } 
    )    

export default app