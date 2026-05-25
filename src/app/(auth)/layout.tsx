import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="mx-auto w-full max-w-6xl px-6 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white">
            S
          </span>
          Supplier OS
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
