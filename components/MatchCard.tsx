import type { SupplierMatch } from "../lib/types";
import { ScoreBar } from "./ScoreBar";

export function MatchCard({
  match,
  rank,
  selected,
  onSelect
}: {
  match: SupplierMatch;
  rank: number;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <div className={`card match-card ${selected ? "selected-card" : ""}`}>
      <div className="list-item" style={{ alignItems: "center" }}>
        <div>
          <span className="badge">Rank #{rank}</span>
          <h3 style={{ marginTop: 12 }}>{match.name}</h3>
          <p className="muted">{match.explanation}</p>
        </div>
        <div className="score-stack">
          <span className="score">{match.score}</span>
          <span className="confidence">{match.confidence}% confidence</span>
        </div>
      </div>
      <div className="score-grid">
        <ScoreBar label="Rating" value={match.breakdown.rating} />
        <ScoreBar label="Category" value={match.breakdown.categoryMatch} />
        <ScoreBar label="Budget" value={match.breakdown.budgetFit} />
      </div>
      {onSelect ? (
        <button className={selected ? "secondary-button" : "button"} type="button" onClick={onSelect}>
          {selected ? "Selected supplier" : "Select supplier"}
        </button>
      ) : null}
    </div>
  );
}
