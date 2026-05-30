import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZOVO Supplier OS",
  description: "AI-powered supplier marketplace SaaS MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
