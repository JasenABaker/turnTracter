import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getEncounters, resetEncounter, deleteEncounter } from '../api/api';

export default function EncounterSelect() {
  const [encounters, setEncounters] = useState(null);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const navigate = useNavigate();

  const refresh = () => {
    getEncounters()
      .then(setEncounters)
      .catch(err => setError(err.message || 'Failed to load encounters'));
  };

  useEffect(() => { refresh(); }, []);

  const handlePlay = (encounter) => {
    if (encounter.status === 'active') {
      navigate('/gm');
    } else {
      navigate(`/encounters/${encounter.id}/initiative`);
    }
  };

  const handleReset = async (id) => {
    await resetEncounter(id);
    setPendingAction(null);
    refresh();
  };

  const handleDelete = async (id) => {
    await deleteEncounter(id);
    setPendingAction(null);
    refresh();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-titles">
          <h1>Encounters</h1>
          <div className="subtitle">Select an encounter to run, or create a new one</div>
        </div>
        <Link to="/encounters/new" className="btn btn-primary">+ New Encounter</Link>
      </header>

      {error && <div className="form-error">{error}</div>}

      {encounters === null ? (
        <div className="loading">Loading encounters...</div>
      ) : encounters.length === 0 ? (
        <div className="empty-state">No encounters yet. Create one to get started.</div>
      ) : (
        <div className="encounter-list">
          {encounters.map(e => (
            <div key={e.id} className={`encounter-row ${e.status === 'active' ? 'encounter-row-active' : ''}`}>
              <div className="encounter-row-main">
                <div className="encounter-row-name">{e.name}</div>
                <div className="encounter-avatar-stack">
                  {e.playerAvatars.map((p, idx) => (
                    <div className="encounter-avatar" key={idx}>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" />
                      ) : (
                        <span>{p.name.charAt(0)}</span>
                      )}
                    </div>
                  ))}
                  {e.overflowCount > 0 && (
                    <div className="encounter-avatar encounter-avatar-overflow">
                      <span>+{e.overflowCount}</span>
                    </div>
                  )}
                </div>
              </div>
              <span className="encounter-row-count">{e.combatantCount} combatants</span>

              {pendingAction?.id === e.id ? (
                <div className="confirm-clear">
                  <span>
                    {pendingAction.type === 'delete'
                      ? 'Delete this encounter permanently?'
                      : 'Reset this encounter? This resets HP and status for all combatants and clears initiative.'}
                  </span>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => (pendingAction.type === 'delete' ? handleDelete(e.id) : handleReset(e.id))}
                  >
                    Yes, {pendingAction.type === 'delete' ? 'Delete' : 'Reset'}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setPendingAction(null)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="encounter-row-actions">
                  <Link to={`/encounters/${e.id}/build`} className="btn btn-secondary btn-sm">Edit</Link>
                  <button className="btn btn-secondary btn-sm" onClick={() => setPendingAction({ id: e.id, type: 'reset' })}>
                    Reset
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => setPendingAction({ id: e.id, type: 'delete' })}>
                    Delete
                  </button>
                  <button
                    className={`btn ${e.status === 'active' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handlePlay(e)}
                  >
                    ▶ Play
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
