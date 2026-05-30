"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AppShell } from "../../components/AppShell";
import { zovoApi } from "../../components/apiClient";
import type { Project, SupplierMatchResult } from "../../../lib/types";

export default function MatchPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId ?? "";
  const [project, setProject] = useState<Project | null>(null);
  const [match, setMatch] = useState<SupplierMatchResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!projectId) {
        return;
      }

      const [projects, result] = await Promise.all([zovoApi.projects(), zovoApi.match(projectId)]);
      setProject(projects.find((candidate) => candidate.id === projectId) ?? null);
      setMatch(result);
    }

    void load().catch((caught) => setError(caught instanceof Error ? caught.message : "Failed to load matches"));
  }, [projectId]);

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <span className="eyebrow">AI matching engine</span>
          <h2>{project?.title ?? "Supplier match"}</h2>
          <p className="muted">
            {project
              ? `${project.category} · $${project.budget.toLocaleString()}`
              : "Ranked supplier recommendations"}
          </p>
        </div>
        <Link className="secondary-button" href="/dashboard">
          Back to dashboard
        </Link>
      </div>

      {error ? <div className="error">{error}</div> : null}

      <section className="grid">
        {match?.matches.map((supplier, index) => (
          <div className="card" key={supplier.supplierId}>
            <div className="list-item" style={{ alignItems: "center" }}>
              <div>
                <span className="badge">Rank #{index + 1}</span>
                <h3 style={{ marginTop: 12 }}>{supplier.name}</h3>
                <p className="muted">
                  Weighted score = rating 40% + category match 30% + budget fit 30%
                </p>
              </div>
              <span className="score">{supplier.score}</span>
            </div>
            <div className="grid grid-3" style={{ marginTop: 16 }}>
              <div className="metric">
                <span>Rating</span>
                <strong>{supplier.breakdown.rating}</strong>
              </div>
              <div className="metric">
                <span>Category match</span>
                <strong>{supplier.breakdown.categoryMatch}</strong>
              </div>
              <div className="metric">
                <span>Budget fit</span>
                <strong>{supplier.breakdown.budgetFit}</strong>
              </div>
            </div>
          </div>
        )) ?? <div className="card">Loading AI matches...</div>}
      </section>
    </AppShell>
  );
}
