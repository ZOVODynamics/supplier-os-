import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 🔒 protection route
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar placeholder (optionnel ici) */}
      <aside className="w-64 border-r bg-background">
        <div className="p-4 font-bold">ZOVO OS</div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-muted/30">
        {children}
      </main>
    </div>
  );
}
