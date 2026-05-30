import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container hero">
      <section>
        <span className="eyebrow">AI Supplier Execution Platform</span>
        <h1>Source suppliers, rank matches, and move faster.</h1>
        <p className="lead">
          ZOVO Supplier OS is a lightweight SaaS MVP for buyers and suppliers: post projects,
          onboard suppliers, and use an AI scoring engine to identify the strongest fit by rating,
          category, and budget.
        </p>
        <div className="actions">
          <Link className="button" href="/register">
            Create account
          </Link>
          <Link className="secondary-button" href="/login">
            Login demo
          </Link>
        </div>
      </section>
      <section className="card grid">
        <div className="metric">
          <span>Core engine</span>
          <strong>40/30/30</strong>
          <p className="muted">Rating, category match, and budget compatibility scoring.</p>
        </div>
        <div className="grid grid-2">
          <div className="metric">
            <span>Database</span>
            <strong>JSON</strong>
          </div>
          <div className="metric">
            <span>Deploy</span>
            <strong>Vercel</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
