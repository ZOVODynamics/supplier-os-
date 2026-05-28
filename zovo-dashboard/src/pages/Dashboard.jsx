export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <span className="text-xl font-bold">Z</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">ZOVO</h1>
                <p className="text-xs text-slate-400">Supplier Intelligence System</p>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <a href="#" className="text-sm text-slate-300 hover:text-white transition-colors">Dashboard</a>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Suppliers</a>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Analytics</a>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Settings</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white">Welcome to AMIN</h2>
          <p className="mt-1 text-slate-400">AI-powered autonomous supplier intelligence system</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">Active Suppliers</span>
              <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-xs text-cyan-400">+12%</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-white">247</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">Risk Alerts</span>
              <span className="rounded-full bg-amber-500/10 px-2 py-1 text-xs text-amber-400">3 new</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-white">8</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">Cost Savings</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">+23%</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-white">$1.2M</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">AI Insights</span>
              <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-400">Active</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-white">156</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-800/50 p-6">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <p className="mt-2 text-slate-400">Your AI-powered supplier intelligence system is ready. Connect your data sources to begin analysis.</p>
          <button className="mt-4 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors">
            Get Started
          </button>
        </div>
      </main>
    </div>
  )
}
