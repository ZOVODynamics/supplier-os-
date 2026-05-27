import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function fetchHealthStatus() {
  const response = await axios.get(`${API_BASE_URL}/health`, {
    timeout: 8000,
    validateStatus: () => true,
  })

  return response.data
}

function App() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadHealth = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await fetchHealthStatus()
      setHealth(data)
    } catch (err) {
      setHealth(null)
      setError(err.message || 'Unable to reach backend health endpoint.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    fetchHealthStatus()
      .then((data) => {
        if (!cancelled) setHealth(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setHealth(null)
          setError(err.message || 'Unable to reach backend health endpoint.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const backendOk = Boolean(health?.backend?.ok)
  const supabaseOk = Boolean(health?.supabase?.ok)
  const platformStatus = useMemo(() => {
    if (loading) return 'Checking'
    if (backendOk && supabaseOk) return 'Operational'
    if (backendOk && !supabaseOk) return 'Backend online'
    return 'Offline'
  }, [backendOk, loading, supabaseOk])

  return (
    <main className="dashboard-shell">
      <section className="hero-panel">
        <nav className="topbar" aria-label="Dashboard navigation">
          <div className="brand-mark">Z</div>
          <div>
            <p className="eyebrow">ZOVO Supplier AI</p>
            <strong>Supplier execution control plane</strong>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <span className="pill">B2B execution SaaS</span>
            <h1>Coordinate operational requests, suppliers, validation, and commission flow.</h1>
            <p>
              A stable MVP foundation for businesses to create work, suppliers to execute tasks,
              and ZOVO to validate completion before ledgering platform commission.
            </p>
          </div>

          <aside className="status-card" aria-live="polite">
            <div className="status-card-header">
              <span className={`status-dot ${backendOk && supabaseOk ? 'ok' : 'warn'}`} />
              <span>{platformStatus}</span>
            </div>
            <dl>
              <div>
                <dt>API base</dt>
                <dd>{API_BASE_URL}</dd>
              </div>
              <div>
                <dt>Last checked</dt>
                <dd>{health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'Pending'}</dd>
              </div>
              <div>
                <dt>Uptime</dt>
                <dd>{health?.uptimeSeconds ? `${health.uptimeSeconds}s` : 'Unavailable'}</dd>
              </div>
            </dl>
            <button type="button" onClick={loadHealth} disabled={loading}>
              {loading ? 'Checking...' : 'Refresh status'}
            </button>
          </aside>
        </div>
      </section>

      <section className="health-grid" aria-label="System health">
        <article className="health-tile">
          <div className="tile-heading">
            <span className={`status-dot ${backendOk ? 'ok' : 'error'}`} />
            <h2>Backend API</h2>
          </div>
          <p>{health?.backend?.message || error || 'Waiting for backend response.'}</p>
        </article>

        <article className="health-tile">
          <div className="tile-heading">
            <span className={`status-dot ${supabaseOk ? 'ok' : 'warn'}`} />
            <h2>Supabase PostgreSQL</h2>
          </div>
          <p>
            {health?.supabase?.message ||
              'Paste Supabase credentials into zovo-backend/.env, then run schema.sql.'}
          </p>
          {health?.supabase?.error ? <code>{health.supabase.error}</code> : null}
        </article>
      </section>

      <section className="workflow-panel" aria-label="Execution workflow">
        <div>
          <p className="eyebrow">Core workflow</p>
          <h2>Built for request execution, validation, and monetization.</h2>
        </div>

        <div className="workflow-steps">
          <div>
            <span>01</span>
            <strong>Business request</strong>
            <p>Capture operational needs with budget, due date, and category.</p>
          </div>
          <div>
            <span>02</span>
            <strong>Supplier execution</strong>
            <p>Assign human or AI suppliers and track submitted execution output.</p>
          </div>
          <div>
            <span>03</span>
            <strong>Platform validation</strong>
            <p>Validate completion before approval, rejection, payout, and commission.</p>
          </div>
          <div>
            <span>04</span>
            <strong>Ledger entries</strong>
            <p>Record commission, supplier payout, adjustments, and refunds.</p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
