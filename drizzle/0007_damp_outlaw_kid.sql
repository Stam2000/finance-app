ALTER TABLE "transactions" ALTER COLUMN "details" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "details" SET DEFAULT '[]'::jsonb;