import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VariantErrorProps {
  message: string;
  onRetry: () => void;
}

export function VariantError({ message, onRetry }: VariantErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <AlertCircle className="size-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-semibold">Variant generation failed</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
