import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />

      <main className="flex-1 p-6 bg-background">
        {children}
      </main>
    </div>
  );
}
