import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PriorityBadge } from "@/components/dashboard/priority-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileText, Plus, Filter } from "lucide-react";
import Link from "next/link";

async function getRequests(userId: string, role: string) {
  const where: Record<string, unknown> = {};
  if (role === "company") {
    where.userId = userId;
  }

  return prisma.request.findMany({
    where,
    include: {
      user: { select: { name: true } },
      matches: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function RequestsPage() {
  const session = await auth();
  const userId = session?.user?.id || "";
  const role = session?.user?.role || "company";

  const requests = await getRequests(userId, role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Requests</h1>
          <p className="text-muted-foreground">
            Manage your supply requests and track their status
          </p>
        </div>
        {(role === "company" || role === "admin") && (
          <Link
            href="/dashboard/requests/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Request
          </Link>
        )}
      </div>

      {/* Filters placeholder */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {requests.length} request{requests.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            No requests yet
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            {role === "company"
              ? "Create your first supply request to get started with finding suppliers."
              : "No supply requests are available at this time."}
          </p>
          {role === "company" && (
            <Link
              href="/dashboard/requests/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Request
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Link
              key={request.id}
              href={`/dashboard/requests/${request.id}`}
              className="block rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {request.title}
                    </h3>
                    <StatusBadge status={request.status} />
                    <PriorityBadge priority={request.priority} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {request.description}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="rounded-md bg-muted px-2 py-1">
                      {request.category}
                    </span>
                    <span>{formatCurrency(request.budget)}</span>
                    {request.deadline && (
                      <span>Due: {formatDate(request.deadline)}</span>
                    )}
                    {request.matches.length > 0 && (
                      <span className="text-primary font-medium">
                        {request.matches.length} match
                        {request.matches.length !== 1 ? "es" : ""}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{formatDate(request.createdAt)}</p>
                  {role !== "company" && request.user?.name && (
                    <p className="mt-1">{request.user.name}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
