import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEncounter, startEncounter } from '../api/api';

export default function InitiativeSetting() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null);
  const [initiatives, setInitiatives] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getEncounter(id).then(setDetail).catch(err => setError(err.message || 'Failed to load encounter'));
  }, [id]);

  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = detail.combatants.map(c => ({
        combatantId: c.id,
        initiativeScore: parseInt(initiatives[c.id], 10) || 0,
      }));
      await startEncounter(id, payload);
      navigate('/gm');
    } catch (err) {
      setError(err.message || 'Failed to start encounter');
    } finally {
      setLoading(false);
    }
  };

  if (error && !detail) {
    return (
      <div className="dashboard">
        <h1>Set Initiative</h1>
        <div className="form-error">{error}</div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="dashboard">
        <h1>Set Initiative</h1>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-titles">
          <h1>Set Initiative</h1>
          <div className="subtitle">{detail.name}</div>
        </div>
      </header>

      <table className="table">
        <thead>
          <tr><th>Name</th><th>Type</th><th style={{ width: 140 }}>Initiative</th></tr>
        </thead>
        <tbody>
          {detail.combatants.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>
                <span className={`tag ${!c.isMonster && !c.isNpc ? 'tag-accent' : c.isMonster ? 'tag-neutral' : 'tag-plain'}`}>
                  {!c.isMonster && !c.isNpc ? 'Player' : c.isMonster ? 'Monster' : 'NPC'}
                </span>
              </td>
              <td>
                <input
                  type="number"
                  className="input"
                  placeholder="Roll or enter"
                  value={initiatives[c.id] ?? ''}
                  onChange={e => setInitiatives(prev => ({ ...prev, [c.id]: e.target.value }))}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {error && <div className="form-error">{error}</div>}

      <div className="creator-actions">
        <button className="btn btn-primary" onClick={handleStart} disabled={loading}>
          {loading ? 'Starting…' : 'Start Encounter ▶'}
        </button>
        <Link to={`/encounters/${id}/build`} className="btn btn-secondary">← Back</Link>
      </div>
    </div>
  );
}
