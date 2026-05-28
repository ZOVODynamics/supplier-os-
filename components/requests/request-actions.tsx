"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface Request {
  id: string;
  status: string;
}

export function RequestActions({ request }: { request: Request }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  }

  async function deleteRequest() {
    if (!confirm("Are you sure you want to delete this request?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/requests/${request.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard/requests");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to delete request:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-10 w-10 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-border hover:bg-muted transition-colors"
      >
        <MoreVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-20 w-48 rounded-lg border border-border bg-card p-1 shadow-lg">
            {request.status === "open" && (
              <button
                onClick={() => updateStatus("in_progress")}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
              >
                <Edit className="h-4 w-4" />
                Start Progress
              </button>
            )}
            {request.status === "in_progress" && (
              <button
                onClick={() => updateStatus("completed")}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
              >
                <CheckCircle className="h-4 w-4" />
                Mark Completed
              </button>
            )}
            {request.status !== "cancelled" && request.status !== "completed" && (
              <button
                onClick={() => updateStatus("cancelled")}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
              >
                <XCircle className="h-4 w-4" />
                Cancel Request
              </button>
            )}
            <hr className="my-1 border-border" />
            <button
              onClick={deleteRequest}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
