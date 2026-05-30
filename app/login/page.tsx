"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { saveSession, zovoApi } from "../components/apiClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("amina@acme.example");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const auth = await zovoApi.login({ email, password });
      saveSession(auth);
      router.push("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <form className="form-card form-grid" onSubmit={submit}>
        <span className="eyebrow">Secure access</span>
        <h1 style={{ fontSize: 48 }}>Login</h1>
        <p className="muted">Use the seeded buyer account or register a new buyer/supplier.</p>
        {error ? <div className="error">{error}</div> : null}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            minLength={8}
            required
          />
        </div>
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login to dashboard"}
        </button>
        <Link className="secondary-button" href="/register">
          Create an account
        </Link>
      </form>
    </main>
  );
}
