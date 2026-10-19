import { useState } from 'react';
import { updateHp, updateMissedAttack, updateInitiative, updateDeathSaves, removeCombatant, updateBonusAc, updateDamageTaken, updateLastHit, updateCondition } from '../api/api';
import EditableCell from './EditableCell';
import HpDeltaCell from './HpDeltaCell';
import AddConditionDialog from './AddConditionDialog';
import HoverStatBlock from './HoverStatBlock';
import { getCombatantStatus } from '../utils/combatantStatus';

function DamageDeltaCell({ damageTaken, onSave }) {
  const [editing, setEditing] = useState(false);
  const [delta, setDelta] = useState('');

  const handleSave = () => {
    setEditing(false);
    const parsed = parseInt(delta, 10);
    if (!isNaN(parsed) && parsed !== 0) {
      onSave(Math.max(0, damageTaken + parsed));
    }
    setDelta('');
  };

  if (editing) {
    return (
      <span className="hp-delta-editor">
        <span className="hp-current">{damageTaken}</span>
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
    <span className="editable-cell hp-cell damage-taken" onClick={() => { setDelta(''); setEditing(true); }}>
      {damageTaken} dmg
    </span>
  );
}

function DeathSaveTracker({ id, successes, failures, onUpdate }) {
  const toggle = async (field, current) => {
    const next = current >= 3 ? 0 : current + 1;
    const data = field === 'successes'
      ? { deathSaveSuccesses: next }
      : { deathSaveFailures: next };
    await updateDeathSaves(id, data);
    onUpdate();
  };

  return (
    <div className="death-saves">
      <span className="death-save-group" onClick={() => toggle('successes', successes)} title="Click to add success">
        {[0, 1, 2].map(i => (
          <span key={i} className={`save-dot save-success ${i < successes ? 'filled' : ''}`}>●</span>
        ))}
      </span>
      <span className="death-save-separator">/</span>
      <span className="death-save-group" onClick={() => toggle('failures', failures)} title="Click to add failure">
        {[0, 1, 2].map(i => (
          <span key={i} className={`save-dot save-failure ${i < failures ? 'filled' : ''}`}>●</span>
        ))}
      </span>
    </div>
  );
}

export default function CombatantTable({ combatants, activeTurnId, onUpdate }) {
  const [conditionCombatant, setConditionCombatant] = useState(null);

  const handleDelete = async (id) => {
    await removeCombatant(id);
    onUpdate();
  };

  if (combatants.length === 0) {
    return <div className="empty-state">No combatants yet. Add some above!</div>;
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Type</th>
            <th>Init</th>
            <th>HP / Dmg</th>
            <th>Temp HP</th>
            <th>AC</th>
            <th>Bonus AC</th>
            <th>Missed</th>
            <th>Last Hit</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {combatants.map(c => {
            const status = getCombatantStatus(c);
            const isDead = c.manualDead || (!c.unknownHp && c.currentHp <= 0 && (c.isMonster || c.deathSaveFailures >= 3));
            const isUnconscious = !c.unknownHp && c.currentHp <= 0 && !c.isMonster && c.deathSaveFailures < 3;

            return (
              <tr
                key={c.id}
                className={`combatant-row-clickable ${c.id === activeTurnId ? 'active-row' : ''} ${isDead ? 'dead-row' : ''}`}
                onClick={() => setConditionCombatant(c)}
              >
                <td>{c.turnOrder}</td>
                <td className="name-cell">
                  {c.imageUrl && <img src={c.imageUrl} alt="" className="table-avatar" />}
                  {(c.isMonster || c.isNpc) ? (
                    <HoverStatBlock monster={c}>
                      <span className={isDead ? 'strikethrough' : ''}>{c.name}</span>
                    </HoverStatBlock>
                  ) : (
                    <span className={isDead ? 'strikethrough' : ''}>{c.name}</span>
                  )}
                </td>
                <td>
                  <span className={`tag ${c.isMonster ? 'tag-neutral' : c.isNpc ? 'tag-plain' : 'tag-accent'}`}>
                    {c.isMonster ? 'Monster' : c.isNpc ? 'NPC' : 'Player'}
                  </span>
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <EditableCell
                    value={c.initiativeScore}
                    onSave={val => { updateInitiative(c.id, val).then(onUpdate); }}
                  />
                </td>
                <td onClick={e => e.stopPropagation()}>
                  {c.unknownHp ? (
                    <DamageDeltaCell
                      damageTaken={c.damageTaken || 0}
                      onSave={val => { updateDamageTaken(c.id, val).then(onUpdate); }}
                    />
                  ) : (
                    <HpDeltaCell
                      currentHp={c.currentHp}
                      maxHp={c.hp}
                      tempHp={c.tempHp}
                      onSave={hpData => { updateHp(c.id, hpData).then(onUpdate); }}
                    />
                  )}
                </td>
                <td onClick={e => e.stopPropagation()}>
                  {c.unknownHp ? (
                    <span className="text-muted">—</span>
                  ) : (
                    <EditableCell
                      value={c.tempHp}
                      min={0}
                      onSave={val => { updateHp(c.id, { tempHp: val }).then(onUpdate); }}
                    />
                  )}
                </td>
                <td>
                  {c.unknownAc ? (
                    <span className="ac-display ac-unknown">?</span>
                  ) : (
                    <span className="ac-display">
                      {c.armorClass + (c.bonusAc || 0)}
                      {c.bonusAc > 0 && <span className="ac-bonus-indicator"> (+{c.bonusAc})</span>}
                    </span>
                  )}
                </td>
                <td onClick={e => e.stopPropagation()}>
                  {c.unknownAc ? (
                    <span className="text-muted">—</span>
                  ) : (
                    <EditableCell
                      value={c.bonusAc || 0}
                      min={0}
                      onSave={val => { updateBonusAc(c.id, val).then(onUpdate); }}
                    />
                  )}
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <EditableCell
                    value={c.highestMissedAttack}
                    min={0}
                    onSave={val => { updateMissedAttack(c.id, val).then(onUpdate); }}
                  />
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <EditableCell
                    value={c.lastHitNumber || 0}
                    min={0}
                    onSave={val => { updateLastHit(c.id, val).then(onUpdate); }}
                  />
                </td>
                <td onClick={e => e.stopPropagation()}>
                  {status && <span className={status.className}>{status.label}</span>}
                  {c.activeConditions && c.activeConditions.length > 0 && (
                    <div className="active-condition-tags">
                      {c.activeConditions.map(cond => (
                        <span key={cond} className="tag tag-outline">{cond}</span>
                      ))}
                    </div>
                  )}
                  {c.unknownHp && (
                    <div className="condition-toggles">
                      <button
                        className={`btn btn-xs condition-btn ${c.manualBloodied ? 'condition-active bloodied-active' : 'btn-ghost'}`}
                        onClick={() => { updateCondition(c.id, { manualBloodied: !c.manualBloodied }).then(onUpdate); }}
                        title="Toggle Bloodied"
                      >
                        🩸
                      </button>
                      <button
                        className={`btn btn-xs condition-btn ${c.manualDead ? 'condition-active dead-active' : 'btn-ghost'}`}
                        onClick={() => { updateCondition(c.id, { manualDead: !c.manualDead }).then(onUpdate); }}
                        title="Toggle Dead"
                      >
                        💀
                      </button>
                    </div>
                  )}
                  {isUnconscious && (
                    <DeathSaveTracker
                      id={c.id}
                      successes={c.deathSaveSuccesses}
                      failures={c.deathSaveFailures}
                      onUpdate={onUpdate}
                    />
                  )}
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(c.id)} title="Remove">
                    ✕
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {conditionCombatant && (
        <AddConditionDialog
          combatant={conditionCombatant}
          onClose={() => setConditionCombatant(null)}
          onSaved={() => { onUpdate(); }}
        />
      )}
    </div>
  );
}
