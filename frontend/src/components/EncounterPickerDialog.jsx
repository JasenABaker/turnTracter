import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEncounters } from '../api/api';

export default function EncounterPickerDialog({ title, onSelect, onCancel }) {
  const [encounters, setEncounters] = useState(null);

  useEffect(() => {
    getEncounters().then(setEncounters).catch(() => setEncounters([]));
  }, []);

  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-title">{title}</div>
        <div className="dialog-body">
          {encounters === null ? (
            <div className="loading">Loading encounters...</div>
          ) : encounters.length === 0 ? (
            <div className="empty-state">
              No encounters yet. <Link to="/encounters/new">+ New Encounter</Link>
            </div>
          ) : (
            <div className="encounter-picker-list">
              {encounters.map(e => (
                <div key={e.id} className="encounter-picker-row">
                  <span className="encounter-picker-name">{e.name}</span>
                  <span className={`tag ${e.status === 'active' ? 'tag-accent' : 'tag-neutral'}`}>{e.status}</span>
                  <button className="btn btn-primary btn-sm" onClick={() => onSelect(e)}>Select</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
