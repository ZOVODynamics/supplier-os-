function formatBudget(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return 'Budget pending';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(numberValue);
}

function formatDate(value) {
  if (!value) {
    return 'New request';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export default function RequestCard({ request, onDelete, deleting }) {
  const status = request.status || 'open';

  return (
    <article className="request-card">
      <div className="request-card__header">
        <div>
          <p className="eyebrow">Supplier request</p>
          <h3>{request.title || 'Untitled request'}</h3>
        </div>
        <span className="status-pill">{status}</span>
      </div>

      <p className="request-card__description">
        {request.description || 'No description provided.'}
      </p>

      <div className="request-card__meta">
        <span>{formatBudget(request.budget)}</span>
        <span>{formatDate(request.created_at)}</span>
      </div>

      {request.id && (
        <button
          type="button"
          className="ghost-button"
          onClick={() => onDelete(request.id)}
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      )}
    </article>
  );
}
