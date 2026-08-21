import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCompanions } from '../api/api';
import CompanionStatBlockCard from './CompanionStatBlockCard';

export default function CompanionTracker() {
  const [companions, setCompanions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <h1>Companion Tracker</h1>
        <div className="error-banner">Connection error: {error}. Is the backend running?</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard">
        <h1>Companion Tracker</h1>
        <div className="loading">Loading companions...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-titles">
          <h1>Companion Tracker</h1>
          <div className="subtitle">Familiars &amp; Animal Companions</div>
        </div>
        <Link to="/companions" className="btn btn-secondary">Edit Companions</Link>
      </header>

      {companions.length === 0 ? (
        <div className="empty-state">No companions yet. Add one from the Edit Companions screen.</div>
      ) : (
        <div className="companion-list">
          {companions.map(c => (
            <CompanionStatBlockCard key={c.id} companion={c} onUpdate={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}
