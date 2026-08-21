import { useState } from 'react';
import { updateActiveConditions } from '../api/api';

const CONDITIONS = [
  'Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled',
  'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned',
  'Prone', 'Restrained', 'Stunned', 'Unconscious', 'Exhaustion',
];

export default function AddConditionDialog({ combatant, onClose, onSaved }) {
  const [active, setActive] = useState(combatant.activeConditions || []);
  const [busy, setBusy] = useState(false);

  const toggle = async (condition) => {
    const next = active.includes(condition)
      ? active.filter(c => c !== condition)
      : [...active, condition];
    setActive(next);
    setBusy(true);
    try {
      await updateActiveConditions(combatant.id, next);
      onSaved();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-title">Add Condition — {combatant.name}</div>
        <div className="dialog-body">
          <div className="condition-grid">
            {CONDITIONS.map(condition => (
              <span
                key={condition}
                className={`tag ${active.includes(condition) ? 'tag-accent' : 'tag-outline'} condition-tag`}
                onClick={() => !busy && toggle(condition)}
              >
                {condition}
              </span>
            ))}
          </div>
        </div>
        <div className="dialog-actions">
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
