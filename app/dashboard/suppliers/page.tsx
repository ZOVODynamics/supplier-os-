import prisma from "@/lib/prisma";
import { Star, CheckCircle, MapPin, Briefcase, Search } from "lucide-react";
import Link from "next/link";

async function getSuppliers() {
  return prisma.supplier.findMany({
    include: {
      matches: {
        where: { status: "accepted" },
        select: { id: true },
      },
    },
    orderBy: [{ verified: "desc" }, { rating: "desc" }],
  });
}

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Supplier Marketplace</h1>
        <p className="text-muted-foreground">
          Browse verified suppliers and find the right partner for your needs
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search suppliers..."
            className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {suppliers.length} supplier{suppliers.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Suppliers Grid */}
      {suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Briefcase className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            No suppliers available
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            New suppliers will appear here once they join the platform.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => {
            const skills: string[] = supplier.skills
              ? JSON.parse(supplier.skills)
              : [];
            const categories: string[] = supplier.categories
              ? JSON.parse(supplier.categories)
              : [];

            return (
              <Link
                key={supplier.id}
                href={`/dashboard/suppliers/${supplier.id}`}
                className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                      {supplier.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {supplier.name}
                        </h3>
                        {supplier.verified && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      {supplier.location && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {supplier.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                  {supplier.description || "No description available"}
                </p>

                {/* Skills */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                  {skills.length > 3 && (
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      +{skills.length - 3}
                    </span>
                  )}
                </div>

                {/* Categories */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {categories.slice(0, 2).map((cat) => (
                    <span
                      key={cat}
                      className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-semibold">{supplier.rating}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {supplier.totalJobs} job{supplier.totalJobs !== 1 ? "s" : ""}{" "}
                    completed
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
