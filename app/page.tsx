import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold">
          ZOVO Supplier OS
        </h1>

        <p className="text-lg text-gray-500">
          AI-powered supplier execution platform
        </p>

        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-lg bg-black text-white"
        >
          Open Dashboard
        </Link>
      </div>
    </main>
  );
}
