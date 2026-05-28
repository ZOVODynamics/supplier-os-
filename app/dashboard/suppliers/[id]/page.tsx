import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Star,
  CheckCircle,
  MapPin,
  Mail,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatCurrency } from "@/lib/utils";

async function getSupplier(id: string) {
  return prisma.supplier.findUnique({
    where: { id },
    include: {
      matches: {
        include: {
          request: {
            select: { id: true, title: true, status: true, budget: true, category: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      user: {
        select: { email: true },
      },
    },
  });
}

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await getSupplier(id);

  if (!supplier) {
    notFound();
  }

  const skills: string[] = supplier.skills ? JSON.parse(supplier.skills) : [];
  const categories: string[] = supplier.categories
    ? JSON.parse(supplier.categories)
    : [];

  const acceptedMatches = supplier.matches.filter((m) => m.status === "accepted");
  const completedJobs = acceptedMatches.filter(
    (m) => m.request.status === "completed"
  ).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/dashboard/suppliers"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to suppliers
      </Link>

      {/* Header Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-primary/10 text-3xl font-bold text-primary">
            {supplier.name[0]}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{supplier.name}</h1>
              {supplier.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>

            <p className="mt-2 text-muted-foreground">
              {supplier.description || "No description available"}
            </p>

            {/* Meta */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {supplier.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {supplier.location}
                </span>
              )}
              {supplier.user?.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {supplier.user.email}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 sm:flex-col sm:items-end">
            <div className="text-center sm:text-right">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-5 w-5 fill-current" />
                <span className="text-2xl font-bold">{supplier.rating}</span>
              </div>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-2xl font-bold text-foreground">
                {supplier.totalJobs}
              </p>
              <p className="text-xs text-muted-foreground">Jobs Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills & Categories */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Skills</h2>
          {skills.length === 0 ? (
            <p className="text-sm text-muted-foreground">No skills listed</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-muted px-3 py-1.5 text-sm text-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Categories</h2>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories listed</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Performance Stats */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">Performance</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span className="text-sm">Total Matches</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {supplier.matches.length}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Accepted</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {acceptedMatches.length}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Completed</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {completedJobs}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Recent Activity
        </h2>
        {supplier.matches.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No activity yet. This supplier hasn&apos;t been matched to any requests.
          </p>
        ) : (
          <div className="space-y-3">
            {supplier.matches.slice(0, 5).map((match) => (
              <Link
                key={match.id}
                href={`/dashboard/requests/${match.request.id}`}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {match.request.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{match.request.category}</span>
                    <span>&middot;</span>
                    <span>{formatCurrency(match.request.budget)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="text-xs font-medium text-primary">
                      {match.score}%
                    </span>
                  </div>
                  <StatusBadge status={match.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
