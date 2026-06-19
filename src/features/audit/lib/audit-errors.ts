export type AuditErrorCode =
  | "invalid_url"
  | "unreachable_page"
  | "timeout"
  | "extraction_failed";

const statusByCode: Record<AuditErrorCode, number> = {
  invalid_url: 400,
  unreachable_page: 422,
  timeout: 504,
  extraction_failed: 500,
};

export class AuditError extends Error {
  readonly code: AuditErrorCode;
  readonly status: number;

  constructor(code: AuditErrorCode, message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "AuditError";
    this.code = code;
    this.status = statusByCode[code];
  }
}

export function toAuditErrorResponse(error: AuditError): Response {
  return Response.json(
    {
      error: error.message,
      code: error.code,
    },
    { status: error.status },
  );
}
