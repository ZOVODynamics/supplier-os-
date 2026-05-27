import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function App() {
  const [status, setStatus] = useState('Checking backend...')

  useEffect(() => {
    axios
      .get(`${apiUrl}/`)
      .then((res) => setStatus(res.data.status))
      .catch(() => setStatus('Backend offline'))
  }, [])

  return (
    <main className="dashboard">
      <section className="hero-card">
        <p className="eyebrow">Supplier operating system</p>
        <h1>🏢 ZOVO Supplier AI</h1>
        <p className="status">
          Status backend: <span>{status}</span>
        </p>
      </section>

      <section className="mvp-card">
        <h2>📌 Business Dashboard (MVP)</h2>
        <ul>
          <li>✔ Ready for Supplier Marketplace</li>
          <li>✔ Ready for AI task routing</li>
          <li>✔ Ready for monetization layer</li>
        </ul>
      </section>

      <section className="next-step">
        <h2>🧠 Next step</h2>
        <p>Connect Supabase schema and AI routing.</p>
      </section>
    </main>
  )
}

export default App
