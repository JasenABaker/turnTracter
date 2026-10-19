import { useState } from 'react';
import { useEncounterState } from '../hooks/useEncounterState';
import { getCombatantStatus } from '../utils/combatantStatus';
import { groupStatCardCombatants } from '../utils/combatantGrouping';
import StatBlockBody from './StatBlockBody';

function formatMemberHp(m) {
  if (m.unknownHp) return `${m.damageTaken || 0} dmg`;
  const status = getCombatantStatus(m);
  if (status?.key === 'dead') return 'Dead';
  return `${m.currentHp}/${m.hp}`;
}

function MonsterRosterDialog({ monster, onClose }) {
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog dialog-wide" onClick={e => e.stopPropagation()}>
        <div className="dialog-title">{monster.name}</div>
        <div className="dialog-body">
          <StatBlockBody monster={monster} maskUnknown={false} fullDescriptions />
        </div>
        <div className="dialog-actions">
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function MonsterRoster() {
  const { state, error, noActiveEncounter } = useEncounterState(2000);
  const [selected, setSelected] = useState(null);

  if (noActiveEncounter) {
    return (
      <div className="dashboard">
        <h1>Monster Roster</h1>
        <div className="empty-state">No active encounter.</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <h1>Monster Roster</h1>
        <div className="error-banner">Connection error: {error}. Is the backend running?</div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="dashboard">
        <h1>Monster Roster</h1>
        <div className="loading">Loading encounter...</div>
      </div>
    );
  }

  const monsterCombatants = state.combatants
    .filter(c => c.isMonster || c.isNpc)
    .slice()
    .sort((a, b) => a.turnOrder - b.turnOrder);

  const groups = groupStatCardCombatants(monsterCombatants);

  return (
    <div className="dashboard">
      <h1>Monster Roster — Round {state.currentRound}</h1>

      {groups.length === 0 ? (
        <div className="empty-state">No monsters or NPCs in this encounter yet.</div>
      ) : (
        <div className="simple-turn-order-list monster-roster-list">
          {groups.map(members => {
            const primary = members[0];
            const isActive = members.some(m => m.id === state.activeTurnId);
            const baseName = primary.name.replace(/\s+\d+$/, '');
            const status = members.length === 1 ? getCombatantStatus(primary) : null;

            return (
              <div
                key={primary.id}
                className={`simple-turn-order-row monster-roster-row ${isActive ? 'simple-turn-order-row-active' : ''}`}
                onClick={() => setSelected(primary)}
              >
                <span className="monster-roster-name">
                  {baseName}
                  {members.length > 1 && <span className="stat-card-count">×{members.length}</span>}
                  {status && <span className={status.className}>{status.label}</span>}
                </span>
                <span className="monster-roster-vitals">
                  <strong>AC</strong> {primary.unknownAc ? '?' : primary.armorClass + (primary.bonusAc || 0)}
                  <strong>HP</strong>{' '}
                  {members.length === 1
                    ? (primary.unknownHp ? `${primary.damageTaken || 0} dmg taken` : `${primary.currentHp}/${primary.hp}`)
                    : members.map(m => formatMemberHp(m)).join(' · ')}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <MonsterRosterDialog monster={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
