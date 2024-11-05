ALTER TABLE "transactions" ALTER COLUMN "details" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "details" DROP DEFAULT;