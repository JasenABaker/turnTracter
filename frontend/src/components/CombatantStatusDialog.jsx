import { useState } from 'react';
import { updateHp, updateDamageTaken, updateCondition, updateDeathSaves } from '../api/api';
import { getCombatantStatus } from '../utils/combatantStatus';
import HpBar from './HpBar';
import ConditionToggleGrid from './ConditionToggleGrid';

function CombatantStatusRow({ combatant, onSaved, showName }) {
  const [deltaValue, setDeltaValue] = useState('');
  const [setValue, setSetValue] = useState('');
  const [busy, setBusy] = useState(false);

  const status = getCombatantStatus(combatant);
  const isUnconscious = !combatant.unknownHp && combatant.currentHp <= 0 && !combatant.isMonster && combatant.deathSaveFailures < 3;

  const apply = async (fn) => {
    setBusy(true);
    try {
      await fn();
      onSaved();
    } finally {
      setBusy(false);
    }
  };

  const applyDelta = (sign) => {
    const amount = parseInt(deltaValue, 10);
    setDeltaValue('');
    if (isNaN(amount) || amount === 0) return;
    const delta = amount * sign;

    if (combatant.unknownHp) {
      const newDamageTaken = Math.max(0, (combatant.damageTaken || 0) - delta);
      apply(() => updateDamageTaken(combatant.id, newDamageTaken));
      return;
    }

    if (delta < 0) {
      const absDamage = Math.abs(delta);
      const tempHp = combatant.tempHp || 0;
      if (tempHp > 0) {
        if (absDamage <= tempHp) {
          apply(() => updateHp(combatant.id, { currentHp: combatant.currentHp, tempHp: tempHp - absDamage }));
        } else {
          const remaining = absDamage - tempHp;
          apply(() => updateHp(combatant.id, { currentHp: Math.max(0, combatant.currentHp - remaining), tempHp: 0 }));
        }
      } else {
        apply(() => updateHp(combatant.id, { currentHp: Math.max(0, combatant.currentHp - absDamage) }));
      }
    } else {
      apply(() => updateHp(combatant.id, { currentHp: Math.min(combatant.hp, combatant.currentHp + delta) }));
    }
  };

  const applySetValue = () => {
    const parsed = parseInt(setValue, 10);
    setSetValue('');
    if (isNaN(parsed)) return;
    if (combatant.unknownHp) {
      apply(() => updateDamageTaken(combatant.id, Math.max(0, parsed)));
    } else {
      apply(() => updateHp(combatant.id, { currentHp: Math.max(0, Math.min(combatant.hp, parsed)) }));
    }
  };

  const toggleBloodied = () => apply(() => updateCondition(combatant.id, { manualBloodied: !combatant.manualBloodied }));
  const toggleDead = () => apply(() => updateCondition(combatant.id, { manualDead: !combatant.manualDead }));

  const toggleDeathSave = (field, current) => {
    const next = current >= 3 ? 0 : current + 1;
    const data = field === 'successes' ? { deathSaveSuccesses: next } : { deathSaveFailures: next };
    apply(() => updateDeathSaves(combatant.id, data));
  };

  return (
    <div className="combatant-status-row">
      {showName && <div className="combatant-status-row-name">{combatant.name}</div>}
      <div className="combatant-status-hp">
        {combatant.unknownHp ? (
          <span className="tag tag-outline">{combatant.damageTaken || 0} damage taken</span>
        ) : (
          <>
            <HpBar currentHp={combatant.currentHp} maxHp={combatant.hp} mini />
            {combatant.tempHp > 0 && <span className="tag tag-accent">+{combatant.tempHp} Temp</span>}
          </>
        )}
      </div>

      <div className="player-health-row-controls combatant-status-controls">
        <div className="player-health-delta">
          <button type="button" className="btn btn-secondary btn-xs" onClick={() => applyDelta(-1)} disabled={busy} title="Subtract">−</button>
          <input
            type="number"
            className="input input-xs player-health-delta-input"
            placeholder="0"
            value={deltaValue}
            onChange={e => setDeltaValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') applyDelta(1); }}
          />
          <button type="button" className="btn btn-secondary btn-xs" onClick={() => applyDelta(1)} disabled={busy} title="Add">+</button>
        </div>
        <div className="player-health-set">
          <span className="player-health-set-label">Set</span>
          <input
            type="number"
            className="input input-xs player-health-input"
            placeholder={combatant.unknownHp ? String(combatant.damageTaken || 0) : String(combatant.currentHp)}
            value={setValue}
            onChange={e => setSetValue(e.target.value)}
            onBlur={applySetValue}
            onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
          />
          {!combatant.unknownHp && <span className="player-health-max">/ {combatant.hp}</span>}
        </div>
      </div>

      <div className="combatant-status-toggles">
        <span className="combatant-status-toggles-label">Status</span>
        {status && <span className={status.className}>{status.label}</span>}
        <button
          type="button"
          className={`btn btn-xs condition-btn ${combatant.manualBloodied ? 'condition-active bloodied-active' : 'btn-ghost'}`}
          onClick={toggleBloodied}
          disabled={busy}
          title="Toggle Bloodied"
        >
          🩸 Bloodied
        </button>
        <button
          type="button"
          className={`btn btn-xs condition-btn ${combatant.manualDead ? 'condition-active dead-active' : 'btn-ghost'}`}
          onClick={toggleDead}
          disabled={busy}
          title="Toggle Dead"
        >
          💀 Dead
        </button>
      </div>

      <ConditionToggleGrid combatant={combatant} onSaved={onSaved} />

      {isUnconscious && (
        <div className="death-saves combatant-status-death-saves">
          <span className="death-save-row-label">Saves</span>
          <span className="death-save-group" onClick={() => toggleDeathSave('successes', combatant.deathSaveSuccesses)} title="Click to add success">
            {[0, 1, 2].map(i => (
              <span key={i} className={`save-dot save-success ${i < combatant.deathSaveSuccesses ? 'filled' : ''}`}>●</span>
            ))}
          </span>
          <span className="death-save-separator">/</span>
          <span className="death-save-row-label">Fails</span>
          <span className="death-save-group" onClick={() => toggleDeathSave('failures', combatant.deathSaveFailures)} title="Click to add failure">
            {[0, 1, 2].map(i => (
              <span key={i} className={`save-dot save-failure ${i < combatant.deathSaveFailures ? 'filled' : ''}`}>●</span>
            ))}
          </span>
        </div>
      )}
    </div>
  );
}

export default function CombatantStatusDialog({ combatants, onClose, onSaved }) {
  const primary = combatants[0];
  const baseName = primary.name.replace(/\s+\d+$/, '');
  const title = combatants.length > 1 ? `${baseName} ×${combatants.length}` : primary.name;

  return (
    <div className="dialog-backdrop dialog-backdrop-elevated" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-title">{title}</div>
        <div className="dialog-body">
          {combatants.map((c, idx) => (
            <div key={c.id}>
              <CombatantStatusRow combatant={c} onSaved={onSaved} showName={combatants.length > 1} />
              {idx < combatants.length - 1 && <hr className="hr" />}
            </div>
          ))}
        </div>
        <div className="dialog-actions">
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
