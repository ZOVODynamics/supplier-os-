"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";

interface MatchActionsProps {
  matchId: string;
}

export function MatchActions({ matchId }: MatchActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  async function updateStatus(status: string) {
    setIsLoading(status);
    try {
      const response = await fetch(`/api/matching/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update match:", error);
    } finally {
      setIsLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => updateStatus("accepted")}
        disabled={isLoading !== null}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-emerald-500 hover:bg-emerald-500/10 disabled:opacity-50 transition-colors"
        title="Accept"
      >
        {isLoading === "accepted" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </button>
      <button
        onClick={() => updateStatus("rejected")}
        disabled={isLoading !== null}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors"
        title="Reject"
      >
        {isLoading === "rejected" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
