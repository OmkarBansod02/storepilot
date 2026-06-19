ALTER TYPE "public"."event_type" ADD VALUE 'product_view';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'add_to_cart';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'checkout_start';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'purchase';--> statement-breakpoint
ALTER TABLE "experiments" ALTER COLUMN "primary_conversion_event" SET DEFAULT 'purchase';--> statement-breakpoint
ALTER TABLE "pages" ALTER COLUMN "primary_conversion_event" SET DEFAULT 'purchase';--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "product_id" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "variant_id" uuid;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "revenue_cents" integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "cart_value_cents" integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "currency" text;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "events_product_id_idx" ON "events" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "events_variant_id_idx" ON "events" USING btree ("variant_id");