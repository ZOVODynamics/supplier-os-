export const metadata = {
  title: "ZOVO Supplier OS",
  description: "AI Supplier Engine"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
