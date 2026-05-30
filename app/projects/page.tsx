"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { AppShell } from "../../components/AppShell";
import { StateMessage } from "../../components/StateMessage";
import { zovoApi } from "../../services/clientApi";
import type { Project } from "../../lib/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setProjects(await zovoApi.projects());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load().catch((caught) => setError(caught instanceof Error ? caught.message : "Failed to load projects"));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const form = new FormData(event.currentTarget);

    try {
      await zovoApi.createProject({
        title: String(form.get("title")),
        description: String(form.get("description")),
        category: String(form.get("category")),
        budget: Number(form.get("budget"))
      });
      event.currentTarget.reset();
      setSuccess("Project created. Continue to AI matching or add more suppliers.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to create project");
    }
  }

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <span className="eyebrow">Demo step 2</span>
          <h2>Create a sourcing project</h2>
          <p className="muted">Capture the buyer need that will be scored against the supplier network.</p>
        </div>
        <Link className="secondary-button" href="/suppliers">
          Next: suppliers
        </Link>
      </div>

      <section className="grid grid-2">
        <form className="card form-grid" onSubmit={submit}>
          <h3>New project</h3>
          {error ? <StateMessage type="error" title="Project error">{error}</StateMessage> : null}
          {success ? <StateMessage type="success" title="Project ready">{success}</StateMessage> : null}
          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" className="input" defaultValue="Smart packaging sourcing" required />
          </div>
          <div className="field">
            <label htmlFor="category">Category</label>
            <input id="category" name="category" className="input" defaultValue="packaging" required />
          </div>
          <div className="field">
            <label htmlFor="budget">Budget</label>
            <input id="budget" name="budget" className="input" type="number" min="1" defaultValue="30000" required />
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="textarea"
              defaultValue="Find a reliable supplier for launch-ready retail packaging and fulfillment support."
              required
            />
          </div>
          <button className="button" type="submit">
            Create project
          </button>
        </form>

        <div className="card">
          <h3>Project pipeline</h3>
          <div className="list">
            {loading ? <StateMessage type="loading" title="Loading projects" /> : null}
            {!loading && projects.length === 0 ? (
              <StateMessage type="empty" title="No projects yet">Create a buyer project to unlock matching.</StateMessage>
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
                  View matches
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
