"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

interface RunMatchingButtonProps {
  requestId: string;
}

export function RunMatchingButton({ requestId }: RunMatchingButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function runMatching() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to run matching:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={runMatching}
      disabled={isLoading}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Matching...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Run AI Match
        </>
      )}
    </button>
  );
}
