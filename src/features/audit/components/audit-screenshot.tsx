import { Lock, Monitor } from "lucide-react";

interface AuditScreenshotProps {
  screenshotUrl: string | null;
  url: string;
}

export function AuditScreenshot({ screenshotUrl, url }: AuditScreenshotProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(23,23,23,0.04),0_24px_48px_-32px_rgba(23,23,23,0.18)]">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-surface-muted px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-2.5 rounded-full bg-muted-foreground/25"
          />
          <span
            aria-hidden
            className="size-2.5 rounded-full bg-muted-foreground/25"
          />
          <span
            aria-hidden
            className="size-2.5 rounded-full bg-muted-foreground/25"
          />
        </div>
        <div className="ml-2 flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground">
          <Lock className="size-3 shrink-0 text-muted-foreground/70" />
          <span className="truncate">{url}</span>
        </div>
      </div>

      {screenshotUrl ? (
        <img
          src={screenshotUrl}
          alt={`Screenshot of ${url}`}
          className="aspect-[16/10] w-full object-cover object-top"
        />
      ) : (
        <div className="flex aspect-[16/10] w-full flex-col items-center justify-center bg-surface-muted">
          <Monitor className="size-9 text-muted-foreground/40" />
          <span className="mt-2 text-xs text-muted-foreground">
            Screenshot preview
          </span>
        </div>
      )}
    </div>
  );
}
