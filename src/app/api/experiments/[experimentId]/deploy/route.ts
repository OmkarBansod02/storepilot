import {
  ExperimentError,
  toExperimentErrorResponse,
} from "@/features/experiments/lib/experiment-errors";
import { experimentIdInputSchema } from "@/features/experiments/schemas/experiment-input";
import { deployExperimentWinner } from "@/features/experiments/server/deploy-experiment-winner";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    experimentId: string;
  }>;
}

export async function POST(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const params = await context.params;
  const parsed = experimentIdInputSchema.safeParse(params);

  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid experiment id.",
        details: parsed.error.issues.map((issue) => ({
          path: issue.path.join(".") || "params",
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  try {
    const result = await deployExperimentWinner(parsed.data);

    return Response.json(result);
  } catch (error) {
    if (error instanceof ExperimentError) {
      return toExperimentErrorResponse(error);
    }

    return Response.json(
      {
        error: "Winner deployment failed unexpectedly.",
        code: "experiment_winner_deployment_failed",
      },
      { status: 500 },
    );
  }
}
