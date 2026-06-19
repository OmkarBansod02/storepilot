import { z } from "zod";

export type ParsedJsonBody<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      response: Response;
    };

export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<ParsedJsonBody<T>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      response: Response.json(
        { error: "Request body must be valid JSON." },
        { status: 400 },
      ),
    };
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    return {
      ok: false,
      response: Response.json(
        {
          error: "Invalid request body.",
          details: result.error.issues.map((issue) => ({
            path: issue.path.join(".") || "body",
            message: issue.message,
          })),
        },
        { status: 400 },
      ),
    };
  }

  return {
    ok: true,
    data: result.data,
  };
}
