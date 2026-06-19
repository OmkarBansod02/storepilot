export type VariantErrorCode =
  | "page_not_found"
  | "diagnosis_not_ready"
  | "proposal_validation_failed";

export class VariantError extends Error {
  constructor(
    public readonly code: VariantErrorCode,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "VariantError";
  }
}

export function toVariantErrorResponse(error: VariantError): Response {
  return Response.json(
    {
      error: error.message,
      code: error.code,
    },
    { status: error.status },
  );
}
