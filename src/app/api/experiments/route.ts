import { createExperimentInputSchema } from "@/features/experiments/schemas/experiment-input";
import {
  ExperimentError,
  toExperimentErrorResponse,
} from "@/features/experiments/lib/experiment-errors";
import { createExperiment } from "@/features/experiments/server/create-experiment";
import { getRunningExperimentSummary } from "@/features/experiments/server/get-running-experiment-summary";
import { parseJsonBody } from "@/lib/validations/parse-json-body";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const pageId = new URL(request.url).searchParams.get("pageId");
  const parsed = createExperimentInputSchema.safeParse({ pageId });

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

  const experiment = await getRunningExperimentSummary(parsed.data.pageId);

  return Response.json({ experiment });
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseJsonBody(request, createExperimentInputSchema);

  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const result = await createExperiment(parsed.data);

    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ExperimentError) {
      return toExperimentErrorResponse(error);
    }

    return Response.json(
      {
        error: "Experiment creation failed unexpectedly.",
        code: "experiment_creation_failed",
      },
      { status: 500 },
    );
  }
}
