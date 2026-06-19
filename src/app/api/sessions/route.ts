import { createSessionInputSchema } from "@/features/snippet/schemas/session-input";
import { createSession } from "@/features/snippet/server/create-session";
import { parseJsonBody } from "@/lib/validations/parse-json-body";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseJsonBody(request, createSessionInputSchema);

  if (!parsed.ok) {
    return parsed.response;
  }

  const result = await createSession(parsed.data);

  return Response.json(result, { status: result.created ? 201 : 200 });
}
