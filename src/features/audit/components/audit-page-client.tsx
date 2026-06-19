"use client";

import { useState } from "react";
import { z } from "zod";

import { auditResultSchema } from "../schemas/audit-result";
import type { AuditResult, AuditStatus } from "../types";
import { AuditForm } from "./audit-form";
import { AuditLoading } from "./audit-loading";
import { AuditResults } from "./audit-results";
import { AuditEmpty } from "./audit-empty";
import { AuditError } from "./audit-error";

const auditErrorResponseSchema = z.object({
  error: z.string().optional(),
});

export function AuditPageClient() {
  const [status, setStatus] = useState<AuditStatus>("idle");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [submittedUrl, setSubmittedUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(url: string) {
    setSubmittedUrl(url);
    setResult(null);
    setErrorMessage(null);
    setStatus("loading");

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const body: unknown = await response.json();

      if (!response.ok) {
        const parsedError = auditErrorResponseSchema.safeParse(body);
        setErrorMessage(
          parsedError.data?.error ??
            "We couldn't complete the audit for this URL.",
        );
        setStatus("error");
        return;
      }

      const parsedResult = auditResultSchema.safeParse(body);

      if (!parsedResult.success) {
        setErrorMessage("The audit completed, but the response was not valid.");
        setStatus("error");
        return;
      }

      setResult(parsedResult.data);
      setStatus("success");
    } catch {
      setErrorMessage("The audit request failed. Check the URL and try again.");
      setStatus("error");
    }
  }

  function handleReset() {
    setStatus("idle");
    setResult(null);
    setErrorMessage(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <div className="space-y-6">
      <AuditForm
        onSubmit={handleSubmit}
        isLoading={status === "loading"}
        defaultUrl={submittedUrl}
      />

      {status === "idle" && <AuditEmpty />}
      {status === "loading" && <AuditLoading url={submittedUrl} />}
      {status === "error" && (
        <AuditError message={errorMessage ?? undefined} onRetry={handleReset} />
      )}
      {status === "success" && result && (
        <AuditResults result={result} onAuditAnother={handleReset} />
      )}
    </div>
  );
}
