export function ScoreBar({ label, value }: { label: string; value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className="score-row">
      <div className="score-row-label">
        <span>{label}</span>
        <strong>{safeValue}</strong>
      </div>
      <div className="score-track">
        <div className="score-fill" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}
