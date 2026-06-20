import { simulateTrafficInputSchema } from "@/features/demo/schemas/simulate-traffic-input";
import { simulateDemoTraffic } from "@/features/demo/server/simulate-demo-traffic";
import { parseJsonBody } from "@/lib/validations/parse-json-body";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseJsonBody(request, simulateTrafficInputSchema);

  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const result = await simulateDemoTraffic(parsed.data);
    return Response.json(result, { status: 201 });
  } catch {
    return Response.json(
      { error: "Demo traffic simulation failed." },
      { status: 500 },
    );
  }
}
