import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Sparkles, TrendingUp, Star, CheckCircle, X } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RunMatchingButton } from "@/components/matching/run-matching-button";
import { MatchActions } from "@/components/matching/match-actions";

async function getMatchingData(userId: string, role: string) {
  // Get open requests for matching
  const openRequests = await prisma.request.findMany({
    where: {
      ...(role === "company" ? { userId } : {}),
      status: { in: ["open", "matched"] },
    },
    include: {
      user: { select: { name: true } },
      matches: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get recent matches
  const recentMatches = await prisma.match.findMany({
    where: role === "company" ? { request: { userId } } : {},
    include: {
      request: {
        include: { user: { select: { name: true } } },
      },
      supplier: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return { openRequests, recentMatches };
}

export default async function MatchingPage() {
  const session = await auth();
  const userId = session?.user?.id || "";
  const role = session?.user?.role || "company";

  const { openRequests, recentMatches } = await getMatchingData(userId, role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Matching</h1>
          <p className="text-muted-foreground">
            AI-powered supplier matching based on your request requirements
          </p>
        </div>
      </div>

      {/* Open Requests for Matching */}
      {(role === "company" || role === "admin") && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Requests Awaiting Matches
          </h2>
          {openRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No open requests. Create a new request to get AI-powered supplier
                suggestions.
              </p>
              <Link
                href="/dashboard/requests/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Create Request
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {openRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border p-4"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/requests/${request.id}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {request.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>{request.category}</span>
                      <span>&middot;</span>
                      <span>{formatCurrency(request.budget)}</span>
                      {request.matches.length > 0 && (
                        <>
                          <span>&middot;</span>
                          <span className="text-primary font-medium">
                            {request.matches.length} match
                            {request.matches.length !== 1 ? "es" : ""}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={request.status} />
                    <RunMatchingButton requestId={request.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent Matches */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Recent AI Matches
        </h2>
        {recentMatches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No matches yet. Run AI matching on your requests to see suggested
              suppliers.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentMatches.map((match) => {
              const skills: string[] = match.supplier.skills
                ? JSON.parse(match.supplier.skills)
                : [];

              return (
                <div
                  key={match.id}
                  className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    {/* Left: Request Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/requests/${match.request.id}`}
                          className="font-medium text-foreground hover:text-primary truncate"
                        >
                          {match.request.title}
                        </Link>
                        <StatusBadge status={match.status} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {match.request.user?.name} &middot;{" "}
                        {formatDate(match.createdAt)}
                      </p>
                    </div>

                    {/* Center: Supplier Info */}
                    <div className="flex items-center gap-3 lg:min-w-[300px]">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                        {match.supplier.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/dashboard/suppliers/${match.supplier.id}`}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {match.supplier.name}
                          </Link>
                          {match.supplier.verified && (
                            <CheckCircle className="h-3.5 w-3.5 text-primary" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="h-3 w-3 text-amber-500 fill-current" />
                          <span>{match.supplier.rating}</span>
                          <span>&middot;</span>
                          <span className="truncate">
                            {skills.slice(0, 2).join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Score and Actions */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">
                          {match.score}%
                        </span>
                      </div>
                      {match.status === "suggested" && role !== "supplier" && (
                        <MatchActions matchId={match.id} />
                      )}
                    </div>
                  </div>

                  {/* Match Notes */}
                  {match.notes && (
                    <p className="mt-3 text-sm text-muted-foreground border-t border-border pt-3">
                      <span className="font-medium">AI Analysis:</span>{" "}
                      {match.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
