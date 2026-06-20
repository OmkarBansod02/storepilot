"use client";

import { CheckCircle2, Loader2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SimulationResponse {
  visitors: number;
  purchases: number;
  error?: string;
}

export function SimulateTrafficButton() {
  const router = useRouter();
  const [isSimulating, setIsSimulating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  async function handleSimulate(): Promise<void> {
    if (isSimulating) return;

    setIsSimulating(true);
    setMessage(null);
    setFailed(false);

    try {
      const response = await fetch("/api/demo/simulate-traffic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitors: 1_000 }),
      });
      const body = (await response.json().catch(() => null)) as
        | SimulationResponse
        | null;

      if (!response.ok || !body) {
        setFailed(true);
        setMessage(body?.error ?? "Traffic simulation failed.");
        return;
      }

      setMessage(
        `Added ${body.visitors.toLocaleString()} visitors and ${body.purchases.toLocaleString()} purchases.`,
      );
      router.refresh();
    } catch {
      setFailed(true);
      setMessage("Traffic simulation failed. Please try again.");
    } finally {
      setIsSimulating(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button
        type="button"
        variant="outline"
        disabled={isSimulating}
        onClick={handleSimulate}
      >
        {isSimulating ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Users className="size-4" />
        )}
        {isSimulating ? "Simulating…" : "Simulate 1,000 visitors"}
      </Button>
      {message && (
        <p
          className={
            failed ? "text-xs text-destructive" : "text-xs text-success"
          }
          role={failed ? "alert" : "status"}
        >
          {!failed && <CheckCircle2 className="mr-1 inline size-3" />}
          {message}
        </p>
      )}
    </div>
  );
}
