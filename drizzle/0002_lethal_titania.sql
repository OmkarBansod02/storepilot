ALTER TYPE "public"."variant_status" ADD VALUE 'deployed';--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "baseline_content" jsonb;