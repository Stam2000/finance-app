import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import accounts from "./accounts"
import transactions from "./transactions"
import  categories  from "./categories"
import summary from "./summary"
import getip from "./getip";
import projects from "./projects"
import conversation from "./conversation"
import detailsTransactions from "./detailsTransactions"

export const runtime = 'nodejs';

const app = new Hono().basePath('/api')


const routes = app.route("/accounts",accounts)
                  .route("/categories",categories)
                  .route("/transactions",transactions)
                  .route("/summary",summary)
                  .route("/getip",getip)
                  .route("/conversation",conversation)
                  .route("/detailsTransactions",detailsTransactions)
                  .route("/projects",projects)



export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)

export type AppType = typeof routes