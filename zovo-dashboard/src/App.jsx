import { useCallback, useEffect, useMemo, useState } from 'react';
import { createRequest, deleteRequest, getRequests } from './api/requests.js';
import CreateRequest from './components/CreateRequest.jsx';
import RequestList from './components/RequestList.jsx';

function App() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const sortedRequests = useMemo(
    () =>
      [...requests].sort((a, b) => {
        const left = new Date(a.created_at || 0).getTime();
        const right = new Date(b.created_at || 0).getTime();
        return right - left;
      }),
    [requests],
  );

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await getRequests();
      setRequests(Array.isArray(result.data) ? result.data : []);

      if (result.error) {
        setMessage(`Backend fallback active: ${result.error}`);
      } else {
        setMessage('');
      }
    } catch (requestError) {
      setRequests([]);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  async function handleCreate(payload) {
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const result = await createRequest(payload);

      if (result.error) {
        setMessage(`Backend fallback active: ${result.error}`);
      }

      await loadRequests();
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    setError('');
    setMessage('');

    try {
      const result = await deleteRequest(id);

      if (result.error) {
        setMessage(`Backend fallback active: ${result.error}`);
      }

      await loadRequests();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="dashboard-shell">
      <section className="hero-section">
        <div>
          <p className="eyebrow">ZOVO Supplier AI</p>
          <h1>ZOVO Supplier AI</h1>
          <p className="subtitle">B2B Execution Platform</p>
        </div>
        <div className="hero-metrics" aria-label="Dashboard metrics">
          <div>
            <span>{requests.length}</span>
            <p>Live requests</p>
          </div>
          <div>
            <span>{loading ? '...' : 'API'}</span>
            <p>Backend source</p>
          </div>
        </div>
      </section>

      {(error || message) && (
        <section className={error ? 'notice notice--error' : 'notice'}>
          {error || message}
        </section>
      )}

      <section className="dashboard-grid">
        <CreateRequest onCreate={handleCreate} submitting={submitting} />
        <div className="requests-column">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Execution pipeline</p>
              <h2>Supplier requests</h2>
            </div>
            <button type="button" className="ghost-button" onClick={loadRequests} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <RequestList
            requests={sortedRequests}
            loading={loading}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        </div>
      </section>
    </main>
  );
}

export default App;
