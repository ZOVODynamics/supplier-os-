import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { StatsCard } from "@/components/dashboard/stats-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  FileText,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

async function getStats(userId: string, role: string) {
  const isAdmin = role === "admin";
  const isCompany = role === "company";

  const totalRequests = await prisma.request.count({
    where: isAdmin ? {} : isCompany ? { userId } : {},
  });

  const activeRequests = await prisma.request.count({
    where: {
      ...(isAdmin ? {} : isCompany ? { userId } : {}),
      status: { in: ["open", "matched", "in_progress"] },
    },
  });

  const completedRequests = await prisma.request.count({
    where: {
      ...(isAdmin ? {} : isCompany ? { userId } : {}),
      status: "completed",
    },
  });

  const totalSuppliers = await prisma.supplier.count();

  const recentRequests = await prisma.request.findMany({
    where: isAdmin ? {} : isCompany ? { userId } : {},
    include: {
      user: { select: { name: true } },
      matches: { include: { supplier: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentMatches = await prisma.match.findMany({
    include: {
      request: { include: { user: { select: { name: true } } } },
      supplier: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return {
    totalRequests,
    activeRequests,
    completedRequests,
    totalSuppliers,
    recentRequests,
    recentMatches,
  };
}

export default async function DashboardPage() {
  const session = await auth();

  const userId = session?.user?.id || "";
  const role = session?.user?.role || "company";

  const stats = await getStats(userId, role);

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {session?.user?.name?.split(" ")[0]}
        </h1>

        <p className="mt-1 text-muted-foreground">
          {"Here's what's happening with your supply chain"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Requests"
          value={stats.totalRequests}
          icon={FileText}
          description="All time"
        />

        <StatsCard
          title="Active Requests"
          value={stats.activeRequests}
          icon={Clock}
          description="In progress"
        />

        <StatsCard
          title="Completed"
          value={stats.completedRequests}
          icon={CheckCircle2}
          description="Successfully fulfilled"
        />

        <StatsCard
          title="Suppliers"
          value={stats.totalSuppliers}
          icon={Users}
          description="Available partners"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Requests
            </h2>

            <Link
              href="/dashboard/requests"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {stats.recentRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No requests yet
              </p>
            ) : (
              stats.recentRequests.map((request) => (
                <Link
                  key={request.id}
                  href={`/dashboard/requests/${request.id}`}
                  className="block rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {request.title}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {request.category} ·{" "}
                        {formatCurrency(request.budget)}
                      </p>
                    </div>

                    <StatusBadge status={request.status} />
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDate(request.createdAt)}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              AI Matches
            </h2>

            <Link
              href="/dashboard/matching"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {stats.recentMatches.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No matches yet
              </p>
            ) : (
              stats.recentMatches.map((match) => (
                <div
                  key={match.id}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {match.supplier.name}
                      </p>

                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        For: {match.request.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1">
                        <TrendingUp className="h-3 w-3 text-primary" />

                        <span className="text-xs font-medium text-primary">
                          {match.score}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <StatusBadge status={match.status} />

                    <span className="text-xs text-muted-foreground">
                      {formatDate(match.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {(role === "company" || role === "admin") && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Quick Actions
          </h2>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/requests/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Create New Request
            </Link>

            <Link
              href="/dashboard/suppliers"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Users className="h-4 w-4" />
              Browse Suppliers
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
