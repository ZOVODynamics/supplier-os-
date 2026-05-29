import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Welcome {session?.user?.name}
      </h1>

      <p className="text-muted-foreground">
        ZOVO Supplier OS Dashboard
      </p>
    </div>
  );
}
