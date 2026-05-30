"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "../../components/AppShell";
import { MatchCard } from "../../components/MatchCard";
import { MetricCard } from "../../components/MetricCard";
import { StateMessage } from "../../components/StateMessage";
import { zovoApi } from "../../services/clientApi";
import type { InvestorStats, Project, Supplier, SupplierMatchResult } from "../../lib/types";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<InvestorStats | null>(null);
  const [match, setMatch] = useState<SupplierMatchResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [projectData, supplierData, statData] = await Promise.all([
          zovoApi.projects(),
          zovoApi.suppliers(),
          zovoApi.stats()
        ]);
        setProjects(projectData);
        setSuppliers(supplierData);
        setStats(statData);
        if (projectData[0]) {
          setMatch(await zovoApi.match(projectData[0].id));
        }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <span className="eyebrow">Investor demo workspace</span>
          <h2>Command dashboard</h2>
          <p className="muted">A complete sourcing flow with secure auth, JSON data, and AI supplier ranking.</p>
        </div>
        <Link className="button" href="/projects">
          Start demo flow
        </Link>
      </div>

      {error ? <StateMessage type="error" title="Dashboard unavailable">{error}</StateMessage> : null}
      {loading ? <StateMessage type="loading" title="Loading workspace">Preparing investor KPIs and AI rankings.</StateMessage> : null}

      <section className="grid grid-4">
        <MetricCard label="Users" value={stats?.totalUsers ?? "--"} helper="Authenticated demo accounts" />
        <MetricCard label="Projects" value={stats?.totalProjects ?? projects.length} helper="Buyer sourcing requests" />
        <MetricCard label="Suppliers" value={stats?.totalSuppliers ?? suppliers.length} helper="Qualified vendor profiles" />
        <MetricCard label="Matches" value={stats?.totalMatches ?? match?.matches.length ?? "--"} helper="AI-ranked opportunities" />
      </section>

      <section className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <div className="section-heading">
            <div>
              <h3>Project pipeline</h3>
              <p className="muted">Projects ready to run through the supplier intelligence engine.</p>
            </div>
            <span className="badge">{stats?.systemStatus ?? "healthy"}</span>
          </div>
          <div className="list">
            {projects.length === 0 && !loading ? (
              <StateMessage type="empty" title="No projects yet">Create the first buyer project to start matching.</StateMessage>
            ) : null}
            {projects.map((project) => (
              <div className="list-item" key={project.id}>
                <div>
                  <strong>{project.title}</strong>
                  <p className="muted">
                    {project.category} · ${project.budget.toLocaleString()} · {project.status}
                  </p>
                </div>
                <Link className="badge" href={`/match/${project.id}`}>
                  Run match
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-heading">
            <div>
              <h3>Top AI ranking</h3>
              <p className="muted">Transparent scoring with confidence and supplier selection rationale.</p>
            </div>
          </div>
          <div className="list">
            {match?.matches.slice(0, 3).map((supplier, index) => (
              <MatchCard match={supplier} rank={index + 1} key={supplier.supplierId} />
            )) ??
              (!loading ? (
                <StateMessage type="empty" title="No matches yet">Create a project and supplier profile.</StateMessage>
              ) : null)}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
