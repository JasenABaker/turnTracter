import { useState } from 'react';
import { updateHp } from '../api/api';
import HpBar from './HpBar';
import ConditionToggleGrid from './ConditionToggleGrid';

function PlayerHealthRow({ player, onChanged }) {
  const [deltaValue, setDeltaValue] = useState('');
  const [setValue, setSetValue] = useState('');
  const [busy, setBusy] = useState(false);

  const apply = async (data) => {
    setBusy(true);
    try {
      await updateHp(player.id, data);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const applyDelta = (sign) => {
    const amount = parseInt(deltaValue, 10);
    setDeltaValue('');
    if (isNaN(amount) || amount === 0) return;
    const delta = amount * sign;

    if (delta < 0) {
      const absDamage = Math.abs(delta);
      const tempHp = player.tempHp || 0;
      if (tempHp > 0) {
        if (absDamage <= tempHp) {
          apply({ currentHp: player.currentHp, tempHp: tempHp - absDamage });
        } else {
          const remaining = absDamage - tempHp;
          apply({ currentHp: Math.max(0, player.currentHp - remaining), tempHp: 0 });
        }
      } else {
        apply({ currentHp: Math.max(0, player.currentHp - absDamage) });
      }
    } else {
      apply({ currentHp: Math.min(player.hp, player.currentHp + delta) });
    }
  };

  const applySetValue = () => {
    const parsed = parseInt(setValue, 10);
    setSetValue('');
    if (isNaN(parsed)) return;
    apply({ currentHp: Math.max(0, Math.min(player.hp, parsed)) });
  };

  return (
    <div className="player-health-row">
      <div className="player-health-row-top">
        <span className="player-health-name">{player.name}</span>
        <HpBar currentHp={player.currentHp} maxHp={player.hp} mini />
        {player.tempHp > 0 && <span className="tag tag-accent player-health-temp">+{player.tempHp} Temp</span>}
      </div>
      <div className="player-health-row-controls">
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
            placeholder={String(player.currentHp)}
            value={setValue}
            onChange={e => setSetValue(e.target.value)}
            onBlur={applySetValue}
            onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
          />
          <span className="player-health-max">/ {player.hp}</span>
        </div>
      </div>
      <ConditionToggleGrid combatant={player} onSaved={onChanged} />
    </div>
  );
}

export default function PlayerHealthDialog({ players, onClose, onSaved }) {
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-title">{players.length === 1 ? players[0].name : 'Player Health'}</div>
        <div className="dialog-body">
          {players.length === 0 ? (
            <div className="empty-state">No players in this encounter.</div>
          ) : (
            <div className="player-health-rows">
              {players.map(p => (
                <PlayerHealthRow key={p.id} player={p} onChanged={onSaved} />
              ))}
            </div>
          )}
        </div>
        <div className="dialog-actions">
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
