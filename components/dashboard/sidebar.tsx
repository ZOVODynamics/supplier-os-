import Link from "next/link";

export function DashboardSidebar() {
  return (
    <aside className="w-64 h-screen border-r p-4">
      <h2 className="font-bold text-lg mb-4">ZOVO OS</h2>

      <nav className="space-y-2">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/dashboard/requests">Requests</Link>
        <Link href="/dashboard/suppliers">Suppliers</Link>
        <Link href="/dashboard/matching">Matching</Link>
      </nav>
    </aside>
  );
}
