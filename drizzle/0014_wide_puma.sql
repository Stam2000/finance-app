ALTER TABLE "detailsTransaction" ALTER COLUMN "transaction_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "budget" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "date" timestamp;