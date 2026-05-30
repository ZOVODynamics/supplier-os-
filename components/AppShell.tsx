"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { clearSession, getSessionUser, getToken, type SessionUser } from "../services/clientApi";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/suppliers", label: "Suppliers" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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
        <Link className="logo" href="/dashboard">
          <span className="logo-mark">Z</span>
          <span>ZOVO Supplier OS</span>
        </Link>
        <nav className="nav">
          {navItems.map((item) => (
            <Link className={pathname === item.href ? "active" : ""} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <button type="button" onClick={logout}>
            Logout
          </button>
        </nav>
        <div className="sidebar-card">
          <span className="badge">{user?.role ?? "SECURE"}</span>
          <h3>{user?.name ?? "Authenticated workspace"}</h3>
          <p className="muted">{user?.company ?? "JWT protected demo environment"}</p>
        </div>
        <div className="demo-steps">
          <span>Demo flow</span>
          <ol>
            <li>Register or login</li>
            <li>Create project</li>
            <li>Add suppliers</li>
            <li>Run AI match</li>
            <li>Select supplier</li>
          </ol>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
