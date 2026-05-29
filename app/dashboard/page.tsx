import Link from "next/link";
import { LayoutDashboard, FileText, Users, Settings } from "lucide-react";

export function DashboardSidebar() {
  return (
    <aside className="h-screen w-64 border-r border-border bg-background p-4">
      {/* Logo */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">ZOVO OS</h2>
        <p className="text-xs text-muted-foreground">
          Supplier Dashboard
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        <Link
          href="/dashboard/requests"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
        >
          <FileText className="h-4 w-4" />
          Requests
        </Link>

        <Link
          href="/dashboard/suppliers"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
        >
          <Users className="h-4 w-4" />
          Suppliers
        </Link>

        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </nav>
    </aside>
  );
}
