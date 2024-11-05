CREATE TABLE IF NOT EXISTS "detailsTransaction" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"quantity" integer,
	"unit_price" integer,
	"amount" integer NOT NULL,
	"transaction_id" text,
	"category_id" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "detailsTransaction" ADD CONSTRAINT "detailsTransaction_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "detailsTransaction" ADD CONSTRAINT "detailsTransaction_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
