ALTER TABLE "detailsTransaction" DROP CONSTRAINT "detailsTransaction_category_id_categories_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "detailsTransaction" ADD CONSTRAINT "detailsTransaction_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
