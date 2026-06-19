"use client";

import { useState } from "react";
import { ArrowRight, Globe, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAuditInputSchema } from "../schemas/audit-input";

interface AuditFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  defaultUrl?: string;
}

export function AuditForm({ onSubmit, isLoading, defaultUrl }: AuditFormProps) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const prefixed = url.match(/^https?:\/\//) ? url : `https://${url}`;
    const result = createAuditInputSchema.safeParse({ url: prefixed });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Please enter a valid URL.");
      return;
    }

    setUrl(result.data.url);
    onSubmit(result.data.url);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div
        className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card p-2 pl-4 shadow-elevated transition-shadow focus-within:border-primary/40 focus-within:ring-3 focus-within:ring-ring/20 has-aria-invalid:border-destructive/40 has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20"
      >
        <Globe className="size-5 shrink-0 text-muted-foreground/70" />
        <Input
          type="text"
          placeholder="https://yourlanding.com"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError(null);
          }}
          disabled={isLoading}
          aria-invalid={!!error}
          className="h-11 flex-1 border-0 bg-transparent px-1 text-base shadow-none focus-visible:ring-0 focus-visible:border-transparent disabled:bg-transparent"
        />
        <Button
          type="submit"
          size="lg"
          disabled={isLoading || !url.trim()}
          className="h-11 px-5 text-[14px] shadow-primary-glow"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Auditing
            </>
          ) : (
            <>
              <Search className="size-4" />
              Run Audit
              <ArrowRight className="size-3.5" />
            </>
          )}
        </Button>
      </div>

      <div className="flex min-h-[20px] items-center justify-between px-1 text-[12.5px]">
        {error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <p className="text-muted-foreground">
            Public URLs only · Takes ~10–20 seconds
          </p>
        )}
      </div>
    </form>
  );
}
