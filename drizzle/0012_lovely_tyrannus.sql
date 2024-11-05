CREATE TABLE IF NOT EXISTS "project" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"budget" integer
);
--> statement-breakpoint
ALTER TABLE "detailsTransaction" ADD COLUMN "project_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "project_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "detailsTransaction" ADD CONSTRAINT "detailsTransaction_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
