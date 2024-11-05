import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { categories,transactions } from "@/db/schema";
import {createId} from "@paralleldrive/cuid2"
import {parse,subDays,startOfMonth,differenceInDays} from "date-fns"
import { zValidator } from "@hono/zod-validator";
import { clerkMiddleware,getAuth } from "@hono/clerk-auth";
import { and,eq,inArray,sql,gte,lte,sum,isNotNull,gt} from "drizzle-orm";
import { insertCategorySchema } from "@/db/schema";
import {z} from "zod"
import { convertAmountFromMiliunits } from "@/lib/utils";


const app = new Hono()
    .get("/", zValidator("query",
        z.object({
            from:z.string().optional(),
            to:z.string().optional(),
            accountId:z.string().optional()
        }),
    ),
    async(c)=>{
        const auth = {userId:"testData"}
        const {from,to,accountId}=c.req.valid("query")



        const defaultTo = new Date();
        const defaultFrom =  subDays(defaultTo,90);

        const startDate = from ? parse(from,"yyyy-MM-dd",new Date()):defaultFrom
        const endDate = to ? parse(to,"yyyy-MM-dd",new Date()):defaultTo


        const data = await db.select({ id:categories.id, 
            name:categories.name, 
            goal:categories.goal, 
            amount:sum(transactions.amount).mapWith(Number) })
            .from(categories) 
            .leftJoin( transactions, 
                eq( transactions.categoryId, categories.id, ) ) 
                .where(and( accountId ? eq(transactions.accountId,accountId):undefined, 
                eq(categories.userId , auth.userId), 
                gte(transactions.date,startDate), 
                lte(transactions.date,endDate) ))
        .groupBy(categories.id, categories.name)

    return c.json({data})
}).get("/all",
async(c)=>{
    const auth = {userId:"testData"}
    const data = await db
      .select({
        id: categories.id,
        name: categories.name,
        goal: categories.goal,
        amount:sum(transactions.amount).mapWith(Number)

      })
      .from(categories)
      .leftJoin(transactions, eq(categories.id, transactions.categoryId))
      .where(eq(categories.userId, auth.userId))
      .groupBy(categories.id, categories.name);

    return c.json({ data });
}).get("/tracking",
        async(c)=>{
            const auth = {userId:"testData"}
            const endDate = new Date()             
            const startDate= startOfMonth(endDate);


            const data = await db
            .select({
              id: categories.id,
              name: categories.name,
              goal: categories.goal,
              amount:sum(transactions.amount).mapWith(Number)
            })
            .from(categories)
            .leftJoin(transactions,and(
                eq(categories.id, transactions.categoryId),
                gte(transactions.date, startDate), 
                lte(transactions.date, endDate)
            ))
            .where(and(
                eq(categories.userId, auth.userId),
                isNotNull(categories.goal),
                gt(categories.goal, 0),
                ))
            .groupBy(categories.id, categories.name, categories.goal);
      
        console.log(data)
          return c.json({ data });
      })
    .get("/:id",
        zValidator("param",z.object(
            {id:z.string().optional()}
        )),
        async(c)=>{
            const auth = {userId:"testData"}
            const {id}= c.req.valid("param")

            if(!id){
                return c.json({error:"Missing Id"},401)
            }

            let [data] = await db.select({
                id:categories.id,
                name:categories.name,
                goal:categories.goal,
            }).from(categories).where(
                and(
                  eq(categories.userId,auth.userId),
                  eq(categories.id,id)  
                ),
            );

            if(!data){
                return c.json({
                    error:"Not found"
                },404)
            }

            data = {
                ...data,
                goal:data.goal ? convertAmountFromMiliunits(data.goal) : 0
            }

           /*  console.log(data) */
            return c.json({data})
        }
    )
    .post("/",

        zValidator("json",insertCategorySchema.pick({
            name:true,
            goal:true
        })),
        async (c)=>{
            const auth = {userId:"testData"}
            const {name,goal} = c.req.valid("json")
            console.log(name)
            if(!auth?.userId){
                return c.json({error:"Unauthorized"},401)
            }

            const [data] = await db.insert(categories).values({
                id:createId(),
                userId: auth.userId,
                name:name,
                goal:goal
            }).returning()

            return c.json({data:{id:data.id,name:data.name}})
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

            const data = await db.delete(categories).where(
                and(
                    eq(categories.userId,auth.userId),
                    inArray(categories.id,values.ids)
                )
            ).returning({
                id:categories.id,
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
        zValidator("json",insertCategorySchema.pick({
            name:true,
            goal:true
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
                .update(categories)
                .set(values)
                .where(
                    and(
                        eq(categories.userId,auth.userId),
                        eq(categories.id,id)
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
            if(!auth?.userId){return c.json({error:"Unauthorized"})}

            const [data] = await db
                .delete(categories).where(
                    and(
                        eq(categories.userId,auth.userId),
                        eq(categories.id,id)
                    )
                ).returning()

                return c.json({data})
        } 
    )    

export default app