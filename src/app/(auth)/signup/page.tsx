import type { Metadata } from "next";
import Link from "next/link";

import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-card">
      <h1 className="text-xl font-semibold text-slate-900">
        Create your account
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Start managing supplier projects in minutes.
      </p>
      <div className="mt-6">
        <SignupForm />
      </div>
      <p className="mt-6 text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
