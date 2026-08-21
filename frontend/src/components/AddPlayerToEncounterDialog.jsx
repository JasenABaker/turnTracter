import { useState } from 'react';
import { addPlayerToEncounter } from '../api/api';

export default function AddPlayerToEncounterDialog({ player, encounter, onDone, onCancel }) {
  const [initiative, setInitiative] = useState('');
  const [saving, setSaving] = useState(false);

  const needsInitiative = encounter.status === 'active';

  const handleConfirm = async () => {
    const initiativeScore = needsInitiative ? (parseInt(initiative, 10) || 0) : null;
    setSaving(true);
    try {
      await addPlayerToEncounter(encounter.id, player.id, initiativeScore);
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-title">Add {player.name} to {encounter.name}</div>
        <div className="dialog-body">
          {needsInitiative ? (
            <div className="field">
              <label>Initiative</label>
              <input
                type="number"
                className="input"
                placeholder="Roll or enter"
                value={initiative}
                onChange={e => setInitiative(e.target.value)}
                autoFocus
              />
            </div>
          ) : (
            <p>Add {player.name} to {encounter.name}?</p>
          )}
        </div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleConfirm} disabled={saving}>
            {saving ? 'Adding…' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
