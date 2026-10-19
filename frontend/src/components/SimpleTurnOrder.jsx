import { getCombatantStatus } from '../utils/combatantStatus';

export default function SimpleTurnOrder({ combatants, activeTurnId, currentRound }) {
  return (
    <div className="simple-turn-order">
      <h3 className="simple-turn-order-title">Turn Order — Round {currentRound}</h3>
      <div className="simple-turn-order-list">
        {combatants.map(c => {
          const status = getCombatantStatus(c);
          const isDead = status?.key === 'dead';
          const isActive = c.id === activeTurnId;
          const emoji = status ? status.label.split(' ')[0] : null;

          return (
            <div
              key={c.id}
              className={`simple-turn-order-row ${isActive ? 'simple-turn-order-row-active' : ''} ${isDead ? 'simple-turn-order-row-dead' : ''}`}
            >
              <span>{c.name}{emoji ? ` ${emoji}` : ''}</span>
              <span className="simple-turn-order-init">{c.initiativeScore}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
