import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Topbar({ email }: { email: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-3 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white">
            S
          </span>
          <span className="font-semibold text-slate-900">Supplier OS</span>
        </Link>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <span className="hidden text-sm text-slate-500 sm:inline">
          {email}
        </span>
        <form action="/auth/signout" method="post">
          <Button type="submit" size="sm" variant="secondary">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
