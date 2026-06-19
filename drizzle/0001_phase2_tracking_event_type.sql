ALTER TABLE "events" ALTER COLUMN "event_type" SET DATA TYPE text;--> statement-breakpoint
UPDATE "events" SET "event_type" = 'scroll_depth' WHERE "event_type" = 'scroll_milestone';--> statement-breakpoint
DROP TYPE "public"."event_type";--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('page_view', 'scroll_depth', 'cta_click', 'form_start', 'form_submit');--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "event_type" SET DATA TYPE "public"."event_type" USING "event_type"::"public"."event_type";
