import { useState } from 'react';
import { addTemplateToEncounter } from '../api/api';

export default function AddToEncounterDialog({ monster, encounter, onDone, onCancel }) {
  const [count, setCount] = useState('1');
  const [initiative, setInitiative] = useState('');
  const [unknownHp, setUnknownHp] = useState(false);
  const [unknownAc, setUnknownAc] = useState(false);
  const [saving, setSaving] = useState(false);

  const needsInitiative = encounter.status === 'active';

  const handleConfirm = async () => {
    const parsedCount = Math.max(1, Math.min(20, parseInt(count, 10) || 1));
    const initiativeScore = needsInitiative ? (parseInt(initiative, 10) || 0) : null;
    setSaving(true);
    try {
      for (let i = 0; i < parsedCount; i++) {
        const name = parsedCount > 1 ? `${monster.name} ${i + 1}` : null;
        await addTemplateToEncounter(encounter.id, monster.id, initiativeScore, name, unknownHp, unknownAc);
      }
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-title">Add {monster.name} to {encounter.name}</div>
        <div className="dialog-body">
          <div className="field" style={{ marginBottom: needsInitiative ? 'var(--space-3)' : 0 }}>
            <label>How many?</label>
            <input
              type="number"
              className="input"
              min="1"
              max="20"
              value={count}
              onChange={e => setCount(e.target.value)}
              autoFocus
            />
          </div>
          {needsInitiative && (
            <div className="field">
              <label>Initiative</label>
              <input
                type="number"
                className="input"
                placeholder="Roll or enter"
                value={initiative}
                onChange={e => setInitiative(e.target.value)}
              />
            </div>
          )}
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={unknownHp}
              onChange={e => setUnknownHp(e.target.checked)}
            />
            Unknown HP
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={unknownAc}
              onChange={e => setUnknownAc(e.target.checked)}
            />
            Unknown AC
          </label>
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
