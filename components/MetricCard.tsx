export function MetricCard({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {helper ? <p className="muted">{helper}</p> : null}
    </div>
  );
}
