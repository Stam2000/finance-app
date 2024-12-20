import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { parse, subDays } from "date-fns";
import { transactions, accounts, categories } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { zValidator } from "@hono/zod-validator";
import { and, eq, inArray, desc, lte, gte, sql } from "drizzle-orm";
import { insertTransactionSchema } from "@/db/schema";
import { z } from "zod";
import { convertAmountFormMiliunits } from "@/lib/utils";
import { detailsTransactions } from "@/db/schema";
import { DetailsTransactionsType } from "@/db/schema";

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
      }),
    ),
    async (c) => {
      const personaId = c.req.header("X-Persona-ID") || "testData";
      const auth = { userId: personaId };
      const { from, to, accountId } = c.req.valid("query");

      const defaultTo = new Date();
      const defaultFrom = subDays(defaultTo, 30);
      const startDate = from
        ? parse(from, "yyyy-MM-dd", new Date())
        : defaultFrom;
      const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

      const transactionData = await db
        .select({
          id: transactions.id,
          amount: transactions.amount,
          account: accounts.name,
          category: categories.name,
          payee: transactions.payee,
          notes: transactions.notes,
          date: transactions.date,
          projectId: transactions.projectId,
          accountId: transactions.accountId,
          categoryId: transactions.categoryId,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            accountId ? eq(transactions.accountId, accountId) : undefined,
            eq(accounts.userId, auth.userId),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate),
          ),
        )
        .orderBy(desc(transactions.date));

      let details: DetailsTransactionsType[] = [];
      if (transactionData.length > 0) {
        const transactionsId = transactionData.map((t) => t.id);
        details = await db
          .select({
            id: detailsTransactions.id,
            name: detailsTransactions.name,
            quantity: detailsTransactions.quantity,
            unitPrice: detailsTransactions.unitPrice,
            amount: detailsTransactions.amount,
            transactionId: detailsTransactions.transactionId,
            CategoryId: detailsTransactions.categoryId,
          })
          .from(detailsTransactions)
          .leftJoin(
            categories,
            eq(detailsTransactions.categoryId, categories.id),
          )
          .where(inArray(detailsTransactions.transactionId, transactionsId));
      }

      details = details.map((detail) => ({
        ...detail,
        amount: convertAmountFormMiliunits(detail.amount ? detail.amount : 0),
        unitPrice: convertAmountFormMiliunits(
          detail.unitPrice ? detail.unitPrice : 0,
        ),
      }));

      const data = transactionData.map((transaction) => ({
        ...transaction,
        amount: convertAmountFormMiliunits(transaction.amount),
        detailsTransactions: details.filter(
          (d) => d.transactionId === transaction.id,
        ),
      }));

      return c.json({ data });
    },
  )
  .get("/:id", zValidator("param", z.object({ id: z.string() })), async (c) => {
    const personaId = c.req.header("X-Persona-ID") || "testData";
    const auth = { userId: personaId };
    const { id } = c.req.valid("param");

    const transactionData = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        account: accounts.name,
        category: categories.name,
        payee: transactions.payee,
        notes: transactions.notes,
        date: transactions.date,
        projectId: transactions.projectId,
        accountId: transactions.accountId,
        categoryId: transactions.categoryId,
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(eq(transactions.id, id!), eq(accounts.userId, auth.userId)));

    let details:
      | {
          id: string;
          name?: string | null | undefined;
          quantity?: number | null | undefined;
          unitPrice: number | null;
          amount: number;
          transactionId: string;
        }[]
      | undefined = [];
    if (transactionData.length > 0) {
      const transactionsId = transactionData.map((t) => t.id);
      details = await db
        .select({
          id: detailsTransactions.id,
          name: detailsTransactions.name,
          quantity: detailsTransactions.quantity,
          unitPrice: detailsTransactions.unitPrice,
          amount: detailsTransactions.amount,
          transactionId: detailsTransactions.transactionId,
        })
        .from(detailsTransactions)
        .leftJoin(categories, eq(detailsTransactions.categoryId, categories.id))
        .where(inArray(detailsTransactions.transactionId, transactionsId));
    }

    details = details.map((detail) => ({
      ...detail,
      amount: convertAmountFormMiliunits(detail.amount),
      unitPrice: convertAmountFormMiliunits(
        !detail.unitPrice ? 0 : detail.unitPrice,
      ),
    }));

    const data = transactionData.map((transaction) => ({
      ...transaction,
      amount: convertAmountFormMiliunits(transaction.amount),
      detailsTransactions: details.filter(
        (d) => d.transactionId === transaction.id,
      ),
    }));

    if (!data) {
      return c.json(
        {
          error: "Not found",
        },
        404,
      );
    }

    return c.json({ data });
  })
  .post(
    "/",
    zValidator(
      "json",
      insertTransactionSchema.omit({
        id: true,
      }),
    ),
    async (c) => {
      const personaId = c.req.header("X-Persona-ID");
      const auth = { userId: personaId };
      const values = c.req.valid("json");

      const [data] = await db
        .insert(transactions)
        .values({
          id: createId(),
          ...values,
        })
        .returning();

      return c.json({ data });
    },
  )
  .post(
    "/bulk-delete",
    zValidator(
      "json",
      z.object({
        ids: z.array(z.string()),
      }),
    ),
    async (c) => {
      const personaId = c.req.header("X-Persona-ID") || "testData";
      const auth = { userId: personaId };
      const values = c.req.valid("json");

      const transactionsToDelete = db.$with("transactions_to_delete").as(
        db
          .select({
            id: transactions.id,
          })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(
            and(
              inArray(transactions.id, values.ids),
              eq(accounts.userId, auth.userId),
            ),
          ),
      );

      const data = await db
        .with(transactionsToDelete)
        .delete(transactions)
        .where(
          and(
            inArray(
              transactions.id,
              sql`(select id from ${transactionsToDelete})`,
            ),
          ),
        )
        .returning({
          id: transactions.id,
        });

      return c.json({ data });
    },
  )
  .post(
    "/bulk-create",

    zValidator(
      "json",
      z.array(
        insertTransactionSchema.omit({
          id: true,
        }),
      ),
    ),
    async (c) => {
      const personaId = c.req.header("X-Persona-ID") || "testData";
      const auth = { userId: personaId };
      const values = c.req.valid("json");

      const data = await db
        .insert(transactions)
        .values(
          values.map((value) => ({
            id: createId(),
            ...value,
          })),
        )
        .returning();

      return c.json({ data });
    },
  )
  .patch(
    "/:id",

    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      }),
    ),
    zValidator(
      "json",
      insertTransactionSchema.omit({
        id: true,
      }),
    ),
    async (c) => {
      const personaId = c.req.header("X-Persona-ID") || "testData";
      const auth = { userId: personaId };
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (!id) {
        return c.json({ error: "Id not found" }, 400);
      }

      const transactionsToUpdate = db.$with("transactions_to_update").as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(
            and(eq(transactions.id, id), eq(accounts.userId, auth.userId)),
          ),
      );
      const [data] = await db
        .with(transactionsToUpdate)
        .update(transactions)
        .set(values)
        .where(
          inArray(
            transactions.id,
            sql`(select id from  ${transactionsToUpdate})`,
          ),
        )
        .returning();

      return c.json({ data });
    },
  )
  .delete(
    "/:id",

    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      }),
    ),
    async (c) => {
      const personaId = c.req.header("X-Persona-ID") || "testData";
      const auth = { userId: personaId };
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json(
          {
            error: "Missing id",
          },
          400,
        );
      }

      const transactionsToDelete = db.$with("transactions_to_delete").as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(accounts.id, transactions.accountId))
          .where(
            and(eq(transactions.id, id), eq(accounts.userId, auth.userId)),
          ),
      );

      const [data] = await db
        .with(transactionsToDelete)
        .delete(transactions)
        .where(
          inArray(
            transactions.id,
            sql`(select id from ${transactionsToDelete})`,
          ),
        )
        .returning({
          id: transactions.id,
        });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data });
    },
  );

export default app;
