import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Supplier OS",
    template: "%s · Supplier OS",
  },
  description:
    "Supplier OS — a production-ready SaaS foundation for managing supplier projects.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
