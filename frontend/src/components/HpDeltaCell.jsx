import { useState } from 'react';

export default function HpDeltaCell({ currentHp, maxHp, tempHp, onSave }) {
  const [editing, setEditing] = useState(false);
  const [delta, setDelta] = useState('');

  const handleSave = () => {
    setEditing(false);
    const parsed = parseInt(delta, 10);
    if (!isNaN(parsed) && parsed !== 0) {
      if (parsed < 0 && tempHp > 0) {
        const absDamage = Math.abs(parsed);
        if (absDamage <= tempHp) {
          onSave({ currentHp, tempHp: tempHp - absDamage });
        } else {
          const remainingDamage = absDamage - tempHp;
          onSave({ currentHp: Math.max(0, currentHp - remainingDamage), tempHp: 0 });
        }
      } else {
        const newHp = Math.min(maxHp, Math.max(0, currentHp + parsed));
        onSave({ currentHp: newHp });
      }
    }
    setDelta('');
  };

  if (editing) {
    return (
      <span className="hp-delta-editor">
        <span className="hp-current">{currentHp}</span>
        <input
          type="number"
          value={delta}
          placeholder="+/−"
          onChange={e => setDelta(e.target.value)}
          onBlur={handleSave}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setEditing(false); setDelta(''); } }}
          autoFocus
          className="cell-input hp-delta-input"
        />
      </span>
    );
  }

  return (
    <span className="editable-cell hp-cell" onClick={() => { setDelta(''); setEditing(true); }}>
      {currentHp}<span className="hp-max">/{maxHp}</span>
    </span>
  );
}
