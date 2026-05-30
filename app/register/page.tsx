"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { saveSession, zovoApi } from "../components/apiClient";
import type { UserRole } from "../../lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("BUYER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);

    try {
      const auth = await zovoApi.register({
        name: String(form.get("name")),
        email: String(form.get("email")),
        password: String(form.get("password")),
        company: String(form.get("company")),
        role
      });
      saveSession(auth);
      router.push("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <form className="form-card form-grid" onSubmit={submit}>
        <span className="eyebrow">MVP onboarding</span>
        <h1 style={{ fontSize: 48 }}>Register</h1>
        {error ? <div className="error">{error}</div> : null}
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" className="input" required />
        </div>
        <div className="field">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" className="input" required />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" className="input" type="email" required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" className="input" type="password" minLength={8} required />
        </div>
        <div className="field">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            className="select"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
          >
            <option value="BUYER">Buyer</option>
            <option value="SUPPLIER">Supplier</option>
          </select>
        </div>
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>
        <Link className="secondary-button" href="/login">
          Already have an account?
        </Link>
      </form>
    </main>
  );
}
