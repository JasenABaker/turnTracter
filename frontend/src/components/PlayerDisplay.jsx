import { useEncounterState } from '../hooks/useEncounterState';
import Timer from './Timer';

function HpBar({ currentHp, maxHp, mini }) {
  const ratio = maxHp > 0 ? Math.max(0, currentHp / maxHp) : 0;
  const percent = Math.round(ratio * 100);

  let barColor;
  if (ratio <= 0) barColor = 'var(--blood)';
  else if (ratio <= 0.25) barColor = 'var(--blood-glow)';
  else if (ratio <= 0.5) barColor = '#d9a53d';
  else barColor = 'var(--emerald)';

  return (
    <div className={`hp-bar-container ${mini ? 'hp-bar-mini' : ''}`}>
      <div className="hp-bar-track">
        <div
          className="hp-bar-fill"
          style={{ width: `${percent}%`, backgroundColor: barColor }}
        />
      </div>
      {!mini && <span className="hp-bar-text">{currentHp} / {maxHp}</span>}
    </div>
  );
}

function AcShield({ ac, bonus = 0 }) {
  const totalAc = ac + bonus;
  return (
    <div className={`ac-shield${bonus > 0 ? ' ac-shield-boosted' : ''}`}>
      <svg viewBox="0 0 60 72" className="ac-shield-svg">
        <path
          d="M30 2 L56 16 L56 40 Q56 60 30 70 Q4 60 4 40 L4 16 Z"
          fill="var(--wood2)"
          stroke={bonus > 0 ? 'var(--steel)' : 'var(--brass)'}
          strokeWidth="3"
        />
        <text x="30" y="44" textAnchor="middle" fill={bonus > 0 ? 'var(--steel)' : 'var(--brass)'} fontSize="22" fontWeight="700" fontFamily="Cinzel, serif">
          {totalAc}
        </text>
      </svg>
    </div>
  );
}

export default function PlayerDisplay() {
  const { state, error } = useEncounterState(1000);

  if (error || !state) {
    return (
      <div className="player-display">
        <h1 className="title">⚔ Initiative Tracker</h1>
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

  const isDead = activeCombatant && (
    activeCombatant.manualDead ||
    (!activeCombatant.unknownHp && activeCombatant.currentHp <= 0 &&
      (activeCombatant.isMonster || activeCombatant.deathSaveFailures >= 3))
  );
  const isUnconscious = activeCombatant && !activeCombatant.unknownHp &&
    activeCombatant.currentHp <= 0 &&
    !activeCombatant.isMonster && activeCombatant.deathSaveFailures < 3;

  return (
    <div className="player-display">
      <header className="player-header">
        <h1 className="title">⚔ Initiative Tracker</h1>
        <div className="player-header-row">
          <span className="round-badge round-badge-lg">Round {state.currentRound}</span>
          <Timer
            timerStartTime={state.timerStartTime}
            isTimerPaused={state.isTimerPaused}
            pausedElapsedSeconds={state.pausedElapsedSeconds}
            turnDurationSeconds={state.turnDurationSeconds}
            large
          />
        </div>
      </header>

      <div className="player-layout">
        <div className="player-main">
          {activeCombatant ? (
            <div className={`active-card ${isDead ? 'card-dead' : ''}`}>
              <h2 className="active-combatant-name">{activeCombatant.name}</h2>
              <div className="active-image-wrapper">
                {activeCombatant.imageUrl ? (
                  <img
                    src={activeCombatant.imageUrl}
                    alt={activeCombatant.name}
                    className="active-combatant-img"
                  />
                ) : (
                  <div className="active-combatant-img placeholder-img">
                    <span>{activeCombatant.name.charAt(0)}</span>
                  </div>
                )}
                {activeCombatant.armorClass > 0 && !activeCombatant.isMonster && (
                  <AcShield ac={activeCombatant.armorClass} bonus={activeCombatant.bonusAc || 0} />
                )}
                {activeCombatant.isMonster && activeCombatant.isBloodied && !isDead && (
                  <div className="active-status-overlay">
                    <span className="bloodied-badge">🩸 Bloodied</span>
                  </div>
                )}
                {activeCombatant.isMonster && activeCombatant.manualDead && (
                  <div className="active-status-overlay">
                    <span className="dead-badge">💀 Dead</span>
                  </div>
                )}
              </div>

              {isDead ? (
                <div className="active-status-line">
                  <span className="status-badge status-dead">💀 Dead</span>
                </div>
              ) : isUnconscious ? (
                <div className="active-status-line">
                  {activeCombatant.deathSaveSuccesses >= 3 ? (
                    <span className="status-badge status-stable">💤 Stable</span>
                  ) : (
                    <>
                      <span className="status-badge status-unconscious">😵 Unconscious</span>
                      <div className="death-saves-display">
                        <span className="ds-label">Saves:</span>
                        {[0, 1, 2].map(i => (
                          <span key={i} className={`save-dot save-success ${i < activeCombatant.deathSaveSuccesses ? 'filled' : ''}`}>●</span>
                        ))}
                        <span className="ds-label">Fails:</span>
                        {[0, 1, 2].map(i => (
                          <span key={i} className={`save-dot save-failure ${i < activeCombatant.deathSaveFailures ? 'filled' : ''}`}>●</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : activeCombatant.isMonster ? (
                <div className="active-status-line">
                  {activeCombatant.unknownHp && (
                    <span className="stat-pill damage-pill">{activeCombatant.damageTaken || 0} dmg taken</span>
                  )}
                  {activeCombatant.unknownAc && (
                    <span className="stat-pill ac-unknown-pill">AC: ?</span>
                  )}
                  {activeCombatant.lastHitNumber > 0 && (
                    <span className="stat-pill">Last Hit: {activeCombatant.lastHitNumber}</span>
                  )}
                  <span className="stat-pill">Highest Miss: {activeCombatant.highestMissedAttack}</span>
                </div>
              ) : (
                <div className="hp-bar-section">
                  <HpBar currentHp={activeCombatant.currentHp} maxHp={activeCombatant.hp} />
                  {activeCombatant.tempHp > 0 && (
                    <span className="stat-pill temp-hp">+{activeCombatant.tempHp} temp</span>
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
