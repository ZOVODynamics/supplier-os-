export const metadata = {
  title: "ZOVO Supplier OS",
  description: "AI-powered supplier execution platform",
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
