"use client";

import { FormEvent, useEffect, useState } from "react";

import { AppShell } from "../../components/AppShell";
import { StateMessage } from "../../components/StateMessage";
import { zovoApi } from "../../services/clientApi";
import type { Supplier } from "../../lib/types";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setSuppliers(await zovoApi.suppliers());
    } finally {
      setLoading(false);
    }
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
      setSuccess("Supplier added to the AI ranking pool.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to create supplier");
    }
  }

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <span className="eyebrow">Demo step 3</span>
          <h2>Supplier network</h2>
          <p className="muted">Add vendor profiles and commercial constraints for AI matching.</p>
        </div>
      </div>

      <section className="grid grid-2">
        <form className="card form-grid" onSubmit={submit}>
          <h3>Add supplier</h3>
          {error ? <StateMessage type="error" title="Supplier error">{error}</StateMessage> : null}
          {success ? <StateMessage type="success" title="Supplier added">{success}</StateMessage> : null}
          <div className="field">
            <label htmlFor="name">Supplier name</label>
            <input id="name" name="name" className="input" defaultValue="LaunchPack Global" required />
          </div>
          <div className="field">
            <label htmlFor="categories">Categories</label>
            <input id="categories" name="categories" className="input" defaultValue="packaging, fulfillment" required />
          </div>
          <div className="field">
            <label htmlFor="rating">Rating</label>
            <input id="rating" name="rating" className="input" type="number" min="0" max="5" step="0.1" defaultValue="4.7" required />
          </div>
          <div className="field">
            <label htmlFor="location">Location</label>
            <input id="location" name="location" className="input" defaultValue="Remote" required />
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label htmlFor="minBudget">Min budget</label>
              <input id="minBudget" name="minBudget" className="input" type="number" min="0" defaultValue="5000" required />
            </div>
            <div className="field">
              <label htmlFor="maxBudget">Max budget</label>
              <input id="maxBudget" name="maxBudget" className="input" type="number" min="1" defaultValue="90000" required />
            </div>
          </div>
          <button className="button" type="submit">
            Add supplier
          </button>
        </form>

        <div className="table-card">
          <h3>Supplier ranking inputs</h3>
          {loading ? <StateMessage type="loading" title="Loading suppliers" /> : null}
          {!loading && suppliers.length === 0 ? (
            <StateMessage type="empty" title="No suppliers yet">Add suppliers to generate rankings.</StateMessage>
          ) : null}
          {suppliers.length > 0 ? (
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
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}
