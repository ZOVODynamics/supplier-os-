import RequestCard from './RequestCard.jsx';

export default function RequestList({ requests, loading, onDelete, deletingId }) {
  if (loading) {
    return (
      <section className="panel request-list">
        <div className="skeleton-card" />
        <div className="skeleton-card" />
      </section>
    );
  }

  if (!requests.length) {
    return (
      <section className="panel empty-state">
        <p className="eyebrow">Live requests</p>
        <h2>No requests yet</h2>
        <p>Create the first supplier execution request to populate the pipeline.</p>
      </section>
    );
  }

  return (
    <section className="request-list" aria-label="Supplier requests">
      {requests.map((request) => (
        <RequestCard
          key={request.id || `${request.title}-${request.created_at}`}
          request={request}
          onDelete={onDelete}
          deleting={deletingId === request.id}
        />
      ))}
    </section>
  );
}
