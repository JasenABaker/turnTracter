import { useState } from 'react';
import { getCombatantStatus } from '../utils/combatantStatus';
import PlayerHealthDialog from './PlayerHealthDialog';

export default function SimpleTurnOrder({ combatants, activeTurnId, currentRound, onUpdate }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  return (
    <div className="simple-turn-order">
      <h3 className="simple-turn-order-title">Turn Order — Round {currentRound}</h3>
      <div className="simple-turn-order-list">
        {combatants.map(c => {
          const status = getCombatantStatus(c);
          const isDead = status?.key === 'dead';
          const isActive = c.id === activeTurnId;
          const emoji = status ? status.label.split(' ')[0] : null;
          const isPlayer = !c.isMonster && !c.isNpc;

          return (
            <div
              key={c.id}
              className={`simple-turn-order-row ${isActive ? 'simple-turn-order-row-active' : ''} ${isDead ? 'simple-turn-order-row-dead' : ''} ${isPlayer ? 'simple-turn-order-row-clickable' : ''}`}
              onClick={isPlayer ? () => setSelectedPlayer(c) : undefined}
            >
              <span>{c.name}{emoji ? ` ${emoji}` : ''}</span>
              <span className="simple-turn-order-init">{c.initiativeScore}</span>
            </div>
          );
        })}
      </div>

      {selectedPlayer && (
        <PlayerHealthDialog
          players={[selectedPlayer]}
          onClose={() => setSelectedPlayer(null)}
          onSaved={onUpdate}
        />
      )}
    </div>
  );
}
