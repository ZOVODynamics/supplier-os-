"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { clearSession, getSessionUser, getToken, type SessionUser } from "./apiClient";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setUser(getSessionUser());
  }, [router]);

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">ZOVO Supplier OS</div>
        <nav className="nav">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/suppliers">Suppliers</Link>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </nav>
        <div style={{ marginTop: 28 }} className="card">
          <span className="badge">{user?.role ?? "SECURE"}</span>
          <h3 style={{ marginTop: 14 }}>{user?.name ?? "Authenticated workspace"}</h3>
          <p className="muted">{user?.company ?? "JWT protected demo environment"}</p>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
