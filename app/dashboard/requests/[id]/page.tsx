import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PriorityBadge } from "@/components/dashboard/priority-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  Tag,
  Clock,
  TrendingUp,
  Star,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { RequestActions } from "@/components/requests/request-actions";

async function getRequest(id: string, userId: string, role: string) {
  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      matches: {
        include: {
          supplier: true,
        },
        orderBy: { score: "desc" },
      },
    },
  });

  if (!request) return null;

  // Authorization check
  if (role === "company" && request.userId !== userId) {
    return null;
  }

  return request;
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const request = await getRequest(id, session.user.id, session.user.role);

  if (!request) {
    notFound();
  }

  const isOwner = request.userId === session.user.id || session.user.role === "admin";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/dashboard/requests"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to requests
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{request.title}</h1>
              <StatusBadge status={request.status} />
              <PriorityBadge priority={request.priority} />
            </div>
            <p className="mt-2 text-muted-foreground">{request.description}</p>
          </div>
          {isOwner && <RequestActions request={request} />}
        </div>

        {/* Details Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="font-semibold text-foreground">
                {formatCurrency(request.budget)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <Tag className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="font-semibold text-foreground">{request.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="font-semibold text-foreground">
                {formatDate(request.createdAt)}
              </p>
            </div>
          </div>
          {request.deadline && (
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Deadline</p>
                <p className="font-semibold text-foreground">
                  {formatDate(request.deadline)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Company Info */}
        {session.user.role !== "company" && request.user && (
          <div className="mt-6 flex items-center gap-3 rounded-lg border border-border p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{request.user.name}</p>
              <p className="text-sm text-muted-foreground">{request.user.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* AI Matches */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          AI Suggested Suppliers
        </h2>
        {request.matches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No matches yet. AI will analyze your request and suggest suitable
              suppliers.
            </p>
            <Link
              href="/dashboard/matching"
              className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              Go to AI Matching
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {request.matches.map((match) => {
              const skills: string[] = match.supplier.skills
                ? JSON.parse(match.supplier.skills)
                : [];
              return (
                <div
                  key={match.id}
                  className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/suppliers/${match.supplier.id}`}
                          className="font-semibold text-foreground hover:text-primary"
                        >
                          {match.supplier.name}
                        </Link>
                        {match.supplier.verified && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                        <StatusBadge status={match.status} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {match.supplier.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-semibold">
                            {match.supplier.rating}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {match.supplier.totalJobs} jobs
                        </p>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">
                          {match.score}% match
                        </span>
                      </div>
                    </div>
                  </div>
                  {match.notes && (
                    <p className="mt-3 text-sm text-muted-foreground italic">
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
