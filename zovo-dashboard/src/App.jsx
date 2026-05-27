import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const formatBudget = (budget) => {
  const value = Number(budget);

  if (!Number.isFinite(value)) {
    return 'Not set';
  }

  return currencyFormatter.format(value);
};

const formatDate = (createdAt) => {
  if (!createdAt) {
    return 'Not available';
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return date.toLocaleString();
};

async function readApiError(response) {
  try {
    const body = await response.json();
    return body.error || body.message || `Request failed with status ${response.status}`;
  } catch (_error) {
    return `Request failed with status ${response.status}`;
  }
}

function App() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    budget: '',
  });

  const requestCount = useMemo(() => requests.length, [requests]);

  const fetchRequests = async () => {
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/requests`);

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateForm = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    setFormError('');

    const budget = Number(form.budget);

    if (!form.title.trim()) {
      setFormError('Title is required.');
      return;
    }

    if (!Number.isFinite(budget) || budget <= 0) {
      setFormError('Budget must be greater than 0.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          budget,
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      setForm({
        title: '',
        description: '',
        budget: '',
      });

      await fetchRequests();
    } catch (requestError) {
      setFormError(requestError.message || 'Unable to create request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">ZOVO Supplier AI</p>
          <h1>Supplier request operations</h1>
          <p className="hero-copy">
            Create, track, and review supplier execution requests from one clean operational dashboard.
          </p>
        </div>
        <div className="summary-card">
          <span className="summary-label">Active requests</span>
          <strong>{requestCount}</strong>
        </div>
      </section>

      <section className="content-grid">
        <form className="panel request-form" onSubmit={submitRequest}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Create request</p>
              <h2>New supplier need</h2>
            </div>
          </div>

          {formError ? <div className="alert error">{formError}</div> : null}

          <label>
            Title
            <input
              name="title"
              onChange={updateForm}
              placeholder="Packaging supplier for Q3 launch"
              type="text"
              value={form.title}
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              onChange={updateForm}
              placeholder="Describe the requirement, target market, constraints, and expectations."
              rows="5"
              value={form.description}
            />
          </label>

          <label>
            Budget
            <input
              min="0"
              name="budget"
              onChange={updateForm}
              placeholder="25000"
              step="0.01"
              type="number"
              value={form.budget}
            />
          </label>

          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Creating request...' : 'Create request'}
          </button>
        </form>

        <section className="panel requests-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Live dashboard</p>
              <h2>Requests</h2>
            </div>
            <button className="secondary-button" onClick={fetchRequests} type="button">
              Refresh
            </button>
          </div>

          {error ? <div className="alert error">{error}</div> : null}

          {isLoading ? (
            <div className="empty-state">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="empty-state">No requests have been created yet.</div>
          ) : (
            <div className="request-list">
              {requests.map((request) => (
                <article className="request-card" key={request.id}>
                  <div>
                    <h3>{request.title}</h3>
                    <p>{request.description || 'No description provided.'}</p>
                  </div>
                  <dl>
                    <div>
                      <dt>Budget</dt>
                      <dd>{formatBudget(request.budget)}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>
                        <span className="status-pill">{request.status || 'new'}</span>
                      </dd>
                    </div>
                    <div>
                      <dt>Created</dt>
                      <dd>{formatDate(request.created_at)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;
