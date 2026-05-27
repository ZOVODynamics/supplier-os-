import { useState } from 'react';

const initialForm = {
  title: '',
  description: '',
  budget: '',
};

export default function CreateRequest({ onCreate, submitting }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const budget = Number(form.budget);
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!Number.isFinite(budget) || budget <= 0) {
      setError('Budget must be greater than 0.');
      return;
    }

    setError('');
    const created = await onCreate({
      title: form.title.trim(),
      description: form.description.trim(),
      budget,
      status: 'open',
      created_at: new Date().toISOString(),
    });

    if (created) {
      setForm(initialForm);
    }
  }

  return (
    <form className="panel create-request" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">New execution brief</p>
        <h2>Create supplier request</h2>
        <p className="muted">
          Capture the buyer need and sync it directly to the ZOVO backend.
        </p>
      </div>

      <label>
        Title
        <input
          name="title"
          type="text"
          value={form.title}
          onChange={updateField}
          placeholder="Packaging supplier for Q3 launch"
          required
        />
      </label>

      <label>
        Description
        <textarea
          name="description"
          value={form.description}
          onChange={updateField}
          placeholder="Describe supplier requirements, timeline, constraints, or target markets."
          rows="4"
        />
      </label>

      <label>
        Budget
        <input
          name="budget"
          type="number"
          min="1"
          step="1"
          value={form.budget}
          onChange={updateField}
          placeholder="25000"
          required
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="primary-button" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create request'}
      </button>
    </form>
  );
}
