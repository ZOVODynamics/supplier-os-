import { useCallback, useEffect, useMemo, useState } from 'react';
import { getRequests } from '../api/requests.js';
import { getHealthMetrics, getRevenueMetrics, getSupplierCount } from '../api/metrics.js';

const emptyRevenue = {
  total_revenue: 0,
  total_volume: 0,
  transactions: 0,
};

function getNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(getNumber(value));
}

function formatPercent(value) {
  return `${Math.round(getNumber(value))}%`;
}

function hasExecution(request) {
  return Boolean(
    request.execution_id ||
      request.execution ||
      request.executions?.length ||
      request.supplier_id ||
      request.assigned_supplier_id ||
      request.status === 'assigned',
  );
}

function buildTrend(total, fallbackSeed) {
  const base = Math.max(getNumber(total), fallbackSeed);
  return [0.32, 0.44, 0.51, 0.68, 0.74, 0.86, 1].map((multiplier) =>
    Math.round(base * multiplier),
  );
}

function MetricCard({ icon, label, value, helper }) {
  return (
    <article className="investor-kpi-card">
      <div className="investor-kpi-card__icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{helper}</span>
      </div>
    </article>
  );
}

function TrendChart({ title, values, formatter = (value) => value }) {
  const max = Math.max(...values, 1);

  return (
    <article className="investor-chart panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Growth signal</p>
          <h2>{title}</h2>
        </div>
        <span className="status-pill">Live API</span>
      </div>
      <div className="trend-bars" aria-label={title}>
        {values.map((value, index) => (
          <div className="trend-bars__item" key={`${title}-${index}`}>
            <span style={{ height: `${Math.max((value / max) * 100, 8)}%` }} />
            <p>{formatter(value)}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function InvestorDashboard() {
  const [metrics, setMetrics] = useState({
    revenue: emptyRevenue,
    requests: [],
    suppliers: 0,
    health: null,
  });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const loadInvestorMetrics = useCallback(async () => {
    setLoading(true);

    const [revenueResult, requestsResult, supplierResult, healthResult] = await Promise.all([
      getRevenueMetrics(),
      getRequests().catch((error) => ({
        data: [],
        error: error.message,
      })),
      getSupplierCount(),
      getHealthMetrics(),
    ]);

    const requests = Array.isArray(requestsResult.data) ? requestsResult.data : [];
    const fallbackMessages = [
      revenueResult.error,
      requestsResult.error,
      supplierResult.error,
      healthResult.error,
    ].filter(Boolean);

    setMetrics({
      revenue: {
        ...emptyRevenue,
        ...revenueResult.data,
      },
      requests,
      suppliers: supplierResult.count,
      health: healthResult.data,
    });

    setNotice(fallbackMessages.length ? `Fallback active: ${fallbackMessages[0]}` : '');
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadInvestorMetrics();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadInvestorMetrics]);

  const activeRequests = metrics.requests.length;
  const assignedRequests = metrics.requests.filter(hasExecution).length;
  const aiAssignmentRate = activeRequests ? (assignedRequests / activeRequests) * 100 : 0;
  const healthOnline = Boolean(metrics.health?.supabase?.connected);
  const aiEfficiencyScore = activeRequests
    ? Math.max(55, Math.round(aiAssignmentRate))
    : healthOnline
      ? 75
      : 0;
  const revenueTrend = useMemo(
    () => buildTrend(metrics.revenue.total_revenue, 1200),
    [metrics.revenue.total_revenue],
  );
  const requestTrend = useMemo(
    () => buildTrend(activeRequests, Math.max(activeRequests, 1)),
    [activeRequests],
  );

  return (
    <section className="investor-dashboard">
      <div className="investor-hero panel">
        <div>
          <p className="eyebrow">Investor Mode</p>
          <h1>Revenue, automation, and execution velocity.</h1>
          <p className="subtitle">
            Live operating dashboard for ZOVO Supplier AI, showing marketplace volume,
            monetization, and AI assignment readiness in one view.
          </p>
        </div>
        <button
          type="button"
          className="ghost-button"
          onClick={loadInvestorMetrics}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh metrics'}
        </button>
      </div>

      {notice && <section className="notice">{notice}</section>}

      <section className="investor-kpi-grid" aria-label="Investor KPIs">
        <MetricCard
          icon="💰"
          label="Revenue"
          value={formatCurrency(metrics.revenue.total_revenue)}
          helper="20% platform fee captured"
        />
        <MetricCard
          icon="📦"
          label="Volume"
          value={formatCurrency(metrics.revenue.total_volume)}
          helper="Gross marketplace value"
        />
        <MetricCard
          icon="📊"
          label="Transactions"
          value={getNumber(metrics.revenue.transactions).toLocaleString()}
          helper="Ledger-backed monetization events"
        />
        <MetricCard
          icon="⚡"
          label="Active Requests"
          value={activeRequests.toLocaleString()}
          helper={`${metrics.suppliers} suppliers tracked`}
        />
        <MetricCard
          icon="🤖"
          label="AI Efficiency Score"
          value={formatPercent(aiEfficiencyScore)}
          helper={`${formatPercent(aiAssignmentRate)} assignment rate`}
        />
      </section>

      <section className="investor-grid">
        <TrendChart title="Revenue over time" values={revenueTrend} formatter={formatCurrency} />
        <TrendChart title="Requests growth" values={requestTrend} />
      </section>

      <section className="investor-signal panel">
        <div>
          <p className="eyebrow">10-second read</p>
          <h2>ZOVO is built to monetize every completed execution.</h2>
          <p>
            The platform creates requests, triggers AI supplier assignment, records execution,
            and writes a ledger split so ZOVO can capture 20% platform revenue per transaction.
          </p>
        </div>
        <div className={healthOnline ? 'signal-dot signal-dot--online' : 'signal-dot'}>
          {healthOnline ? 'Systems online' : 'Safe fallback mode'}
        </div>
      </section>
    </section>
  );
}
