"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "../components/AppShell";
import { zovoApi } from "../components/apiClient";
import type { Project, Supplier, SupplierMatchResult } from "../../lib/types";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [match, setMatch] = useState<SupplierMatchResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [projectData, supplierData] = await Promise.all([zovoApi.projects(), zovoApi.suppliers()]);
        setProjects(projectData);
        setSuppliers(supplierData);
        if (projectData[0]) {
          setMatch(await zovoApi.match(projectData[0].id));
        }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Failed to load dashboard");
      }
    }

    void load();
  }, []);

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <span className="eyebrow">Investor demo workspace</span>
          <h2>Dashboard</h2>
          <p className="muted">Live operating view for projects, suppliers, and AI-ranked matches.</p>
        </div>
        <Link className="button" href="/projects">
          New project
        </Link>
      </div>

      {error ? <div className="error">{error}</div> : null}

      <section className="grid grid-3">
        <div className="metric">
          <span>Open projects</span>
          <strong>{projects.length}</strong>
        </div>
        <div className="metric">
          <span>Suppliers</span>
          <strong>{suppliers.length}</strong>
        </div>
        <div className="metric">
          <span>Top match</span>
          <strong>{match?.matches[0]?.score ?? "--"}</strong>
        </div>
      </section>

      <section className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <h3>Projects</h3>
          <div className="list">
            {projects.map((project) => (
              <div className="list-item" key={project.id}>
                <div>
                  <strong>{project.title}</strong>
                  <p className="muted">{project.description}</p>
                </div>
                <Link className="badge" href={`/match/${project.id}`}>
                  Match
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>AI supplier ranking</h3>
          <div className="list">
            {match?.matches.slice(0, 5).map((supplier) => (
              <div className="list-item" key={supplier.supplierId}>
                <div>
                  <strong>{supplier.name}</strong>
                  <p className="muted">
                    Rating {supplier.breakdown.rating} / Category {supplier.breakdown.categoryMatch} /
                    Budget {supplier.breakdown.budgetFit}
                  </p>
                </div>
                <span className="score">{supplier.score}</span>
              </div>
            )) ?? <p className="muted">Create a project to generate AI matches.</p>}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
