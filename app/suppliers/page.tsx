"use client";

import { FormEvent, useEffect, useState } from "react";

import { AppShell } from "../components/AppShell";
import { zovoApi } from "../components/apiClient";
import type { Supplier } from "../../lib/types";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setSuppliers(await zovoApi.suppliers());
  }

  useEffect(() => {
    void load().catch((caught) => setError(caught instanceof Error ? caught.message : "Failed to load suppliers"));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const form = new FormData(event.currentTarget);

    try {
      await zovoApi.createSupplier({
        name: String(form.get("name")),
        categories: String(form.get("categories"))
          .split(",")
          .map((category) => category.trim())
          .filter(Boolean),
        rating: Number(form.get("rating")),
        location: String(form.get("location")),
        minBudget: Number(form.get("minBudget")),
        maxBudget: Number(form.get("maxBudget"))
      });
      event.currentTarget.reset();
      setSuccess("Supplier profile added.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to create supplier");
    }
  }

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <span className="eyebrow">Supplier network</span>
          <h2>Suppliers</h2>
          <p className="muted">Manage vendor profiles used by the AI matching engine.</p>
        </div>
      </div>

      <section className="grid grid-2">
        <form className="card form-grid" onSubmit={submit}>
          <h3>Add supplier</h3>
          {error ? <div className="error">{error}</div> : null}
          {success ? <div className="success">{success}</div> : null}
          <div className="field">
            <label htmlFor="name">Supplier name</label>
            <input id="name" name="name" className="input" required />
          </div>
          <div className="field">
            <label htmlFor="categories">Categories</label>
            <input id="categories" name="categories" className="input" placeholder="electronics, iot" required />
          </div>
          <div className="field">
            <label htmlFor="rating">Rating</label>
            <input id="rating" name="rating" className="input" type="number" min="0" max="5" step="0.1" required />
          </div>
          <div className="field">
            <label htmlFor="location">Location</label>
            <input id="location" name="location" className="input" required />
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label htmlFor="minBudget">Min budget</label>
              <input id="minBudget" name="minBudget" className="input" type="number" min="0" required />
            </div>
            <div className="field">
              <label htmlFor="maxBudget">Max budget</label>
              <input id="maxBudget" name="maxBudget" className="input" type="number" min="1" required />
            </div>
          </div>
          <button className="button" type="submit">
            Add supplier
          </button>
        </form>

        <div className="table-card">
          <h3>Supplier ranking inputs</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Rating</th>
                <th>Budget</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>{supplier.name}</td>
                  <td>{supplier.categories.join(", ")}</td>
                  <td>{supplier.rating}</td>
                  <td>
                    ${supplier.minBudget.toLocaleString()}-${supplier.maxBudget.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
