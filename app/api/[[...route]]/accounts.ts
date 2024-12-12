import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { accounts } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { zValidator } from "@hono/zod-validator";
import { and, eq, inArray } from "drizzle-orm";
import { insertAccountSchema } from "@/db/schema";
import { z } from "zod";

const app = new Hono()
  .get("/", async (c) => {
    const personaId = c.req.header("X-Persona-ID") || "testData";
    const auth = { userId: personaId };

    const data = await db
      .select({
        id: accounts.id,
        name: accounts.name,
      })
      .from(accounts)
      .where(eq(accounts.userId, auth?.userId));
    return c.json({ data });
  })
  .get("/:id", zValidator("param", z.object({ id: z.string() })), async (c) => {
    const personaId = c.req.header("X-Persona-ID") || "testData";
    const auth = { userId: personaId };
    const { id } = c.req.valid("param");

    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [data] = await db
      .select({
        id: accounts.id,
        name: accounts.name,
      })
      .from(accounts)
      .where(and(eq(accounts.userId, auth.userId), eq(accounts.id, id)));

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
      insertAccountSchema.pick({
        name: true,
      }),
    ),
    async (c) => {
      const personaId = c.req.header("X-Persona-ID") || "testData";
      const auth = { userId: personaId };
      const { name } = c.req.valid("json");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .insert(accounts)
        .values({
          id: createId(),
          userId: auth.userId,
          name: name,
        })
        .returning();

      return c.json({ data: { id: data.id, name: data.name } });
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

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.userId, auth.userId),
            inArray(accounts.id, values.ids),
          ),
        )
        .returning({
          id: accounts.id,
        });

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
      insertAccountSchema.pick({
        name: true,
      }),
    ),
    async (c) => {
      const personaId = c.req.header("X-Persona-ID") || "testData";
      const auth = { userId: personaId };
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!id) {
        return c.json({ error: "Id not found" }, 400);
      }

      const [data] = await db
        .update(accounts)
        .set(values)
        .where(and(eq(accounts.userId, auth.userId), eq(accounts.id, id)))
        .returning();

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

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

      const [data] = await db
        .delete(accounts)
        .where(and(eq(accounts.userId, auth.userId), eq(accounts.id, id)))
        .returning();

      return c.json({ data });
    },
  );

export default app;
