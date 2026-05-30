"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AppShell } from "../../../components/AppShell";
import { MatchCard } from "../../../components/MatchCard";
import { StateMessage } from "../../../components/StateMessage";
import { zovoApi } from "../../../services/clientApi";
import type { Project, SupplierMatchResult } from "../../../lib/types";

export default function MatchPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId ?? "";
  const [project, setProject] = useState<Project | null>(null);
  const [match, setMatch] = useState<SupplierMatchResult | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!projectId) return;
      setLoading(true);
      try {
        const [projects, result, bids] = await Promise.all([
          zovoApi.projects(),
          zovoApi.match(projectId),
          zovoApi.bids()
        ]);
        setProject(projects.find((candidate) => candidate.id === projectId) ?? null);
        setMatch(result);
        setSelectedSupplierId(bids.find((bid) => bid.projectId === projectId)?.supplierId ?? "");
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Failed to load matches");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [projectId]);

  async function selectSupplier(supplierId: string) {
    setError("");
    setSuccess("");
    try {
      await zovoApi.selectSupplier({ projectId, supplierId });
      setSelectedSupplierId(supplierId);
      setSuccess("Supplier selected. The project is ready for commercial follow-up.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to select supplier");
    }
  }

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <span className="eyebrow">AI matching engine</span>
          <h2>{project?.title ?? "Supplier match"}</h2>
          <p className="muted">
            {project
              ? `${project.category} · $${project.budget.toLocaleString()} · transparent weighted scoring`
              : "Ranked supplier recommendations"}
          </p>
        </div>
        <Link className="secondary-button" href="/dashboard">
          Back to dashboard
        </Link>
      </div>

      {loading ? <StateMessage type="loading" title="Running AI match">Ranking suppliers with score, confidence, and explanations.</StateMessage> : null}
      {error ? <StateMessage type="error" title="Matching failed">{error}</StateMessage> : null}
      {success ? <StateMessage type="success" title="Supplier selected">{success}</StateMessage> : null}

      <section className="grid">
        {match?.matches.length === 0 && !loading ? (
          <StateMessage type="empty" title="No suppliers available">Add suppliers before running matching.</StateMessage>
        ) : null}
        {match?.matches.map((supplier, index) => (
          <MatchCard
            match={supplier}
            rank={index + 1}
            selected={selectedSupplierId === supplier.supplierId}
            onSelect={() => selectSupplier(supplier.supplierId)}
            key={supplier.supplierId}
          />
        ))}
      </section>
    </AppShell>
  );
}
