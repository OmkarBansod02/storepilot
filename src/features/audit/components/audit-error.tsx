import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AuditErrorProps {
  message?: string;
  onRetry: () => void;
}

export function AuditError({ message, onRetry }: AuditErrorProps) {
  return (
    <Card>
      <CardContent className="py-10">
        <div className="mx-auto max-w-sm text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-destructive/10">
            <AlertCircle className="size-6 text-destructive" />
          </div>
          <h3 className="mt-4 text-base font-semibold tracking-tight">
            Audit didn&apos;t complete
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {message ??
              "We couldn't complete the audit. The page may be unreachable, or the URL may be invalid."}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-5"
            onClick={onRetry}
          >
            <RotateCcw className="size-3.5" />
            Try another URL
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
