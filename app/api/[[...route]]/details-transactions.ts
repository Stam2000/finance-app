import { Hono } from "hono";
import { detailsTransactions } from "@/db/schema";
import { insertdetailsTransactionsSchema } from "@/db/schema";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { createId } from "@paralleldrive/cuid2";
import { subDays, parse } from "date-fns";
import { transactions } from "@/db/schema";
import { accounts } from "@/db/schema";
import { categories } from "@/db/schema";
import { convertAmountFormMiliunits } from "@/lib/utils";
import { and, eq, inArray, desc, lte, gte, sql } from "drizzle-orm";

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
      const { from, to, accountId } = c.req.valid("query");
      const personaId = c.req.header("X-Persona-ID") || "testData";
      const auth = { userId: personaId };

      const defaultTo = new Date();
      const defaultFrom = subDays(defaultTo, 30);

      const startDate = from
        ? parse(from, "yyyy-MM-dd", new Date())
        : defaultFrom;
      const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

      let data = await db
        .select({
          id: detailsTransactions.id,
          name: detailsTransactions.name,
          quantity: detailsTransactions.quantity,
          unitPrice: detailsTransactions.unitPrice,
          amount: detailsTransactions.amount,
          date: transactions.date,
          transactionId: detailsTransactions.transactionId,
          categoryId: detailsTransactions.categoryId,
          category: categories.name,
        })
        .from(detailsTransactions)
        .innerJoin(
          transactions,
          eq(detailsTransactions.transactionId, transactions.id),
        )
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            eq(detailsTransactions.transactionId, transactions.id),
            eq(accounts.userId, auth.userId),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate),
            eq(accounts.userId, auth.userId),
          ),
        );

      data = data.map((detail) => ({
        ...detail,
        amount: convertAmountFormMiliunits(detail.amount),
        unitPrice: convertAmountFormMiliunits(
          !detail.unitPrice ? 0 : detail.unitPrice,
        ),
      }));

      return c.json({ data });
    },
  )
  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string(),
      }),
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      const personaId = c.req.header("X-Persona-ID") || "testData";
      const auth = { userId: personaId };

      let [data] = await db
        .select({
          id: detailsTransactions.id,
          name: detailsTransactions.name,
          quantity: detailsTransactions.quantity,
          unitPrice: detailsTransactions.unitPrice,
          amount: detailsTransactions.amount,
          projectId: detailsTransactions.projectId,
          transactionId: detailsTransactions.transactionId,
          categoryId: detailsTransactions.categoryId,
        })
        .from(detailsTransactions)
        .innerJoin(
          transactions,
          eq(detailsTransactions.transactionId, transactions.id),
        )
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(eq(detailsTransactions.id, id), eq(accounts.userId, auth.userId)),
        );

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      data = {
        ...data,
        amount: convertAmountFormMiliunits(data.amount),
        unitPrice: convertAmountFormMiliunits(
          !data.unitPrice ? 0 : data.unitPrice,
        ),
      };

      return c.json({ data });
    },
  )
  .post(
    "/",
    zValidator("json", insertdetailsTransactionsSchema.omit({ id: true })),
    async (c) => {
      const personaId = c.req.header("X-Persona-ID");
      const auth = { userId: personaId };
      const values = c.req.valid("json");

      const [data] = await db
        .insert(detailsTransactions)
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
        transactionId: z.string().optional(),
      }),
    ),
    async (c) => {
      const auth = { userId: "testData" };
      const values = c.req.valid("json");

      const data = await db
        .delete(detailsTransactions)
        .where(and(inArray(detailsTransactions.id, values.ids)))
        .returning({
          id: detailsTransactions.id,
        });
      return c.json({ data });
    },
  )
  .post(
    "/bulk-create",
    zValidator(
      "json",
      z.array(
        insertdetailsTransactionsSchema.omit({
          id: true,
        }),
      ),
    ),
    async (c) => {
      const auth = { userId: "testData" };
      const values = c.req.valid("json");

      const data = await db
        .insert(detailsTransactions)
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
        id: z.string(),
      }),
    ),
    zValidator(
      "json",
      insertdetailsTransactionsSchema.omit({
        id: true,
      }),
    ),
    async (c) => {
      const personaId = c.req.header("X-Persona-ID") || "testData";
      const auth = { userId: personaId };
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      const transactionToUpdate = db.$with("deetailsTransactions_to_update").as(
        db
          .select({ id: detailsTransactions.id })
          .from(detailsTransactions)
          .innerJoin(
            transactions,
            eq(transactions.id, detailsTransactions.transactionId),
          )
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(
            and(
              eq(detailsTransactions.id, id),
              eq(accounts.userId, auth.userId),
            ),
          ),
      );

      const [data] = await db
        .with(transactionToUpdate)
        .update(detailsTransactions)
        .set(values)
        .where(
          inArray(
            detailsTransactions.id,
            sql`(select id from ${transactionToUpdate})`,
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
        id: z.string(),
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

      const transactionToDelete = db.$with("deetailsTransactions_to_update").as(
        db
          .select({ id: detailsTransactions.id })
          .from(detailsTransactions)
          .innerJoin(
            transactions,
            eq(transactions.id, detailsTransactions.transactionId),
          )
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))

          .where(
            and(
              eq(detailsTransactions.id, id),
              eq(accounts.userId, auth.userId),
            ),
          ),
      );

      const [data] = await db
        .with(transactionToDelete)
        .delete(detailsTransactions)
        .where(
          inArray(
            detailsTransactions.id,
            sql`(select id from ${transactionToDelete})`,
          ),
        )
        .returning({
          id: detailsTransactions.id,
        });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json({ data });
    },
  );

export default app;
