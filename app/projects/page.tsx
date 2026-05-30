"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { AppShell } from "../components/AppShell";
import { zovoApi } from "../components/apiClient";
import type { Project } from "../../lib/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setProjects(await zovoApi.projects());
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
      setSuccess("Project created and ready for matching.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to create project");
    }
  }

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <span className="eyebrow">Buyer command center</span>
          <h2>Projects</h2>
          <p className="muted">Create sourcing requests and launch AI supplier matching.</p>
        </div>
      </div>

      <section className="grid grid-2">
        <form className="card form-grid" onSubmit={submit}>
          <h3>Create project</h3>
          {error ? <div className="error">{error}</div> : null}
          {success ? <div className="success">{success}</div> : null}
          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" className="input" required />
          </div>
          <div className="field">
            <label htmlFor="category">Category</label>
            <input id="category" name="category" className="input" placeholder="electronics" required />
          </div>
          <div className="field">
            <label htmlFor="budget">Budget</label>
            <input id="budget" name="budget" className="input" type="number" min="1" required />
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" className="textarea" required />
          </div>
          <button className="button" type="submit">
            Create project
          </button>
        </form>

        <div className="card">
          <h3>Project pipeline</h3>
          <div className="list">
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
