import { createAuditInputSchema } from "@/features/audit/schemas/audit-input";
import { createAudit } from "@/features/audit/server/create-audit";
import {
  AuditError,
  toAuditErrorResponse,
} from "@/features/audit/lib/audit-errors";
import { parseJsonBody } from "@/lib/validations/parse-json-body";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseJsonBody(request, createAuditInputSchema);

  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const result = await createAudit(parsed.data);

    return Response.json(result);
  } catch (error) {
    if (error instanceof AuditError) {
      return toAuditErrorResponse(error);
    }

    return Response.json(
      {
        error: "Audit failed unexpectedly.",
        code: "extraction_failed",
      },
      { status: 500 },
    );
  }
}
