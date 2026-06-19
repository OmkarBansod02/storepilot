import { recordEventInputSchema } from "@/features/analytics/schemas/event-input";
import { recordSnippetEvent } from "@/features/analytics/server/record-snippet-event";
import { parseJsonBody } from "@/lib/validations/parse-json-body";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseJsonBody(request, recordEventInputSchema);

  if (!parsed.ok) {
    return parsed.response;
  }

  const result = await recordSnippetEvent(parsed.data);

  if (!result.accepted) {
    return Response.json(
      { error: "Session was not found for this page." },
      { status: 404 },
    );
  }

  return Response.json(result, { status: 202 });
}
