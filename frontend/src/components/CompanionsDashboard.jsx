import { useState, useEffect } from 'react';
import { getCompanions } from '../api/api';
import AddCompanionForm from './AddCompanionForm';
import CompanionCard from './CompanionCard';

export default function CompanionsDashboard() {
  const [companions, setCompanions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addOpen, setAddOpen] = useState(true);

  const refresh = async () => {
    try {
      const data = await getCompanions();
      setCompanions(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  if (error) {
    return (
      <div className="dashboard">
        <h1>Companions</h1>
        <div className="error-banner">Connection error: {error}. Is the backend running?</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard">
        <h1>Companions</h1>
        <div className="loading">Loading companions...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-titles">
          <h1>Companions</h1>
          <div className="subtitle">Familiars &amp; Animal Companions</div>
        </div>
      </header>

      <div className="collapsible-section">
        <button
          className={`btn btn-secondary collapsible-header ${addOpen ? 'open-header' : ''}`}
          onClick={() => setAddOpen(!addOpen)}
        >
          <span className={`collapse-arrow ${addOpen ? 'open' : ''}`}>▶</span>
          Add Companion
        </button>
        {addOpen && <AddCompanionForm onAdded={refresh} />}
      </div>

      {companions.length === 0 ? (
        <div className="empty-state">No companions yet. Add one above!</div>
      ) : (
        <div className="companion-list">
          {companions.map(c => (
            <CompanionCard key={c.id} companion={c} onUpdate={refresh} onDeleted={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}
