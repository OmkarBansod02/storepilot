import {
  createVariantInputSchema,
  getLatestPendingVariantInputSchema,
} from "@/features/variants/schemas/variant-input";
import {
  toVariantErrorResponse,
  VariantError,
} from "@/features/variants/lib/variant-errors";
import { createVariant } from "@/features/variants/server/create-variant";
import { getLatestPendingVariant } from "@/features/variants/server/get-latest-pending-variant";
import { parseJsonBody } from "@/lib/validations/parse-json-body";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const pageId = new URL(request.url).searchParams.get("pageId");
  const parsed = getLatestPendingVariantInputSchema.safeParse({ pageId });

  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid request query.",
        details: parsed.error.issues.map((issue) => ({
          path: issue.path.join(".") || "query",
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const variant = await getLatestPendingVariant(parsed.data);

  return Response.json({ variant });
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseJsonBody(request, createVariantInputSchema);

  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const result = await createVariant(parsed.data);

    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof VariantError) {
      return toVariantErrorResponse(error);
    }

    return Response.json(
      {
        error: "Variant generation failed unexpectedly.",
        code: "variant_generation_failed",
      },
      { status: 500 },
    );
  }
}
