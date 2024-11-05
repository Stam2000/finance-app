ALTER TABLE "project" RENAME COLUMN "date" TO "startDate";--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "endDate" timestamp;