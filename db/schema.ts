import {integer, pgTable,text,timestamp} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm"
import {createInsertSchema} from "drizzle-zod"
import {z} from "zod"

export const accounts = pgTable("accounts",{
    id:text("id").primaryKey(),
    plaidId:text("plaid_id"),
    name:text("name").notNull(),
    userId:text("user_id").notNull(),
})

export const accountsRelations = relations(accounts,({many})=>({
    transactions:many(transactions)
}))

export const insertAccountSchema = createInsertSchema(accounts);

export const categories = pgTable("categories",{
    id:text("id").primaryKey(),
    plaidId:text("plaid_id"),
    goal:integer("goal"),
    name:text("name").notNull(),
    userId:text("user_id").notNull(),
})

export const categoriesRelations = relations(categories,({many})=>({
    transactions:many(transactions),
    detailsTransaction:many(detailsTransactions)
}))

export const insertCategorySchema = createInsertSchema(categories)

export const transactions = pgTable("transactions",{
    id:text("id").primaryKey(),
    amount:integer("amount").notNull(),
    payee:text("payee").notNull(),
    notes:text("notes"),
    date: timestamp("date",{mode:"date"}).notNull(),
    accountId:text("account_id").references(()=>accounts.id,{
        onDelete:"cascade"
    }).notNull(),
    projectId:text("project_id").references(()=>projects.id,{
        onDelete:"set null"
    }),
    categoryId:text("category_id").references(()=>categories.id,{
        onDelete:"set null"
    })
})


export const transactionsRelations = relations(transactions,({one,many})=>({
    account:one(accounts,{
        fields:[transactions.accountId],
        references:[accounts.id]
    }),
    categoies:one(categories,{
        fields:[transactions.categoryId],
        references:[categories.id]
    })
    ,
    detailsTransaction:many(detailsTransactions),
    project:many(projects)
}))

export type TransactionsType = typeof transactions.$inferInsert

export const insertTransactionSchema = createInsertSchema(transactions,{
    date:z.coerce.date(),
})


export const detailsTransactions = pgTable("detailsTransaction",{
    id:text("id").primaryKey(),
    name:text("name"),
    quantity:integer("quantity"),
    unitPrice:integer("unit_price"),
    amount:integer("amount").notNull(),
    projectId:text("project_id").references(()=>projects.id,{
        onDelete:"set null"
    }),
    transactionId:text("transaction_id").notNull().references(()=>transactions.id,{
        onDelete:"cascade"
    }),
    categoryId:text("category_id").references(()=>categories.id,{
        onDelete:"set null"
    })
})

export const detailsTransactionRelations = relations(detailsTransactions,({one})=>({
    transaction:one(transactions,{
        fields:[detailsTransactions.transactionId],
        references:[transactions.id]
    }),
    category:one(categories,{
        fields:[detailsTransactions.categoryId],
        references:[categories.id]
    }),
    project:one(projects,{
        fields:[detailsTransactions.projectId],
        references:[projects.id]
    }),
}))

export type DetailsTransactionsType = typeof detailsTransactions.$inferInsert

export const insertdetailsTransactionsSchema = createInsertSchema(detailsTransactions)

export const projects = pgTable("project",{
    id:text("id").primaryKey(),
    name:text("name").notNull(),
    description:text("description"),
    budget:integer("budget").notNull(),
    startDate: timestamp("startDate",{mode:"date"}).notNull(),
    endDate: timestamp("endDate",{mode:"date"}).notNull(),
    userId:text("user_id").notNull(),
})

export const projectsRelations  = relations(projects,({many})=>({
    transactions:many(transactions),
    detailsTransaction:many(detailsTransactions),
}))

export type ProjectsType = typeof projects.$inferInsert


export const insertProjectSchema = createInsertSchema(projects)