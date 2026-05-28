export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ display: "flex" }}>
      <aside style={{ width: 200 }}>Sidebar</aside>
      <section>{children}</section>
    </div>
  )
}
