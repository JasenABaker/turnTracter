import { useEncounterState } from '../hooks/useEncounterState';
import Timer from './Timer';
import HpBar from './HpBar';
import { getCombatantStatus } from '../utils/combatantStatus';

function DeathSavesDisplay({ successes, failures }) {
  return (
    <div className="death-saves-prominent">
      <div className="death-save-row">
        <span className="death-save-row-label">Fails</span>
        {[0, 1, 2].map(i => (
          <span key={i} className={`death-save-pip fail ${i < failures ? 'filled' : ''}`}>
            {i < failures ? '💀' : ''}
          </span>
        ))}
      </div>
      <div className="death-save-row">
        <span className="death-save-row-label">Saves</span>
        {[0, 1, 2].map(i => (
          <span key={i} className={`death-save-pip success ${i < successes ? 'filled' : ''}`} />
        ))}
      </div>
    </div>
  );
}

export default function PlayerDisplay() {
  const { state, error, noActiveEncounter } = useEncounterState(1000);

  if (noActiveEncounter) {
    return (
      <div className="player-display">
        <h1>Turn Tracker</h1>
        <div className="loading">Waiting for the GM to start an encounter...</div>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="player-display">
        <h1>Turn Tracker</h1>
        <div className="loading">{error ? 'Waiting for connection...' : 'Loading...'}</div>
      </div>
    );
  }

  const activeCombatant = state.combatants.find(c => c.id === state.activeTurnId);
  const activeIndex = state.combatants.findIndex(c => c.id === state.activeTurnId);

  const upcoming = [];
  if (state.combatants.length > 0 && activeIndex >= 0) {
    for (let i = 1; i < state.combatants.length; i++) {
      upcoming.push(state.combatants[(activeIndex + i) % state.combatants.length]);
    }
  }

  const status = activeCombatant && getCombatantStatus(activeCombatant);
  const isDead = status?.key === 'dead';
  const isDownButAlive = status?.key === 'unconscious' || status?.key === 'stable';
  const isBloodied = status?.key === 'bloodied';
  const showAcBadge = activeCombatant && activeCombatant.armorClass > 0 && !activeCombatant.isMonster;

  return (
    <div className="player-display">
      <header className="player-header">
        <h1>Turn Tracker</h1>
        <div className="header-stats">
          <span className="round-badge round-badge-lg">Round {state.currentRound}</span>
          {state.turnDurationSeconds > 0 && (
            <Timer
              timerStartTime={state.timerStartTime}
              isTimerPaused={state.isTimerPaused}
              pausedElapsedSeconds={state.pausedElapsedSeconds}
              turnDurationSeconds={state.turnDurationSeconds}
              large
            />
          )}
        </div>
      </header>

      <div className="player-layout">
        <div className="player-main">
          {activeCombatant ? (
            <div>
              <div className={`active-image-wrapper ${isDead ? 'card-dead' : ''} ${isBloodied ? 'bloodied-glow' : ''}`}>
                {activeCombatant.imageUrl ? (
                  <img
                    src={activeCombatant.imageUrl}
                    alt={activeCombatant.name}
                    className="active-combatant-img plate"
                  />
                ) : (
                  <div className="active-combatant-img placeholder-img plate">
                    <span>{activeCombatant.name.charAt(0)}</span>
                  </div>
                )}

                <div className="plate-scrim-top">
                  <h2>{activeCombatant.name}</h2>
                  {showAcBadge && (
                    <span className={`ac-badge ${activeCombatant.bonusAc > 0 ? 'ac-badge-boosted' : ''}`}>
                      {activeCombatant.armorClass + (activeCombatant.bonusAc || 0)}
                    </span>
                  )}
                </div>

                {!activeCombatant.isMonster && !isDead && !isDownButAlive && (
                  <div className="plate-scrim-bottom">
                    <span className="hp-bar-text">
                      <span>HP</span>
                      <span>{activeCombatant.currentHp} / {activeCombatant.hp}</span>
                    </span>
                    <HpBar currentHp={activeCombatant.currentHp} maxHp={activeCombatant.hp} mini />
                    {activeCombatant.tempHp > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <span className="tag tag-accent">+{activeCombatant.tempHp} Temp HP</span>
                      </div>
                    )}
                  </div>
                )}

                {status?.key === 'unconscious' && (
                  <div className="plate-scrim-bottom unconscious-overlay">
                    <span className={`${status.className} status-badge-prominent`}>{status.label}</span>
                    <DeathSavesDisplay
                      successes={activeCombatant.deathSaveSuccesses}
                      failures={activeCombatant.deathSaveFailures}
                    />
                  </div>
                )}

                {activeCombatant.activeConditions && activeCombatant.activeConditions.length > 0 && (
                  <div className="condition-overlay">
                    <span className="condition-overlay-text">
                      {activeCombatant.activeConditions.join(' · ')}
                    </span>
                  </div>
                )}
              </div>

              {((status && status.key !== 'unconscious') || (activeCombatant.isMonster && !isDead)) && (
                <div className="active-status-line">
                  {status && status.key !== 'unconscious' && (
                    <span className={`${status.className} status-badge-prominent`}>{status.label}</span>
                  )}
                  {activeCombatant.isMonster && !isDead && (
                    <div className="monster-stats">
                      {activeCombatant.unknownHp && (
                        <span className="tag tag-outline">{activeCombatant.damageTaken || 0} dmg taken</span>
                      )}
                      {activeCombatant.unknownAc && (
                        <span className="tag tag-outline">AC: ?</span>
                      )}
                      {activeCombatant.lastHitNumber > 0 && (
                        <span className="tag tag-neutral tag-lg">Last Hit: {activeCombatant.lastHitNumber}</span>
                      )}
                      <span className="tag tag-neutral">Highest Miss: {activeCombatant.highestMissedAttack}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="no-active">
              <p>No active combatant. Waiting for encounter to begin...</p>
            </div>
          )}
        </div>

        {upcoming.length > 0 && (
          <div className="upcoming-sidebar">
            <h3>Up Next</h3>
            <ol className="upcoming-name-list">
              {upcoming.map((c, idx) => {
                const dead = c.manualDead || (!c.unknownHp && c.currentHp <= 0 && (c.isMonster || c.deathSaveFailures >= 3));
                const isPlayer = !c.isMonster && !c.isNpc;
                return (
                  <li key={c.id} className={`upcoming-name-item ${idx === 0 ? 'upcoming-next' : ''} ${dead ? 'upcoming-dead' : ''}`}>
                    <span className="upcoming-item-name">
                      {c.name}
                      {dead && ' 💀'}
                      {c.isMonster && c.isBloodied && !dead && ' 🩸'}
                      {c.currentHp <= 0 && !c.isMonster && c.deathSaveFailures < 3 && ' 😵'}
                    </span>
                    {isPlayer && c.currentHp > 0 && (
                      <HpBar currentHp={c.currentHp} maxHp={c.hp} mini />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
