import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEncounterState } from '../hooks/useEncounterState';
import { groupStatCardCombatants } from '../utils/combatantGrouping';
import ActionBar from './ActionBar';
import CombatantStatCard from './CombatantStatCard';
import SimpleTurnOrder from './SimpleTurnOrder';
import PlayerHealthDialog from './PlayerHealthDialog';

export default function GmStatCards() {
  const { state, error, noActiveEncounter, refresh } = useEncounterState(2000);
  const [showHealthDialog, setShowHealthDialog] = useState(false);

  if (noActiveEncounter) {
    return (
      <div className="dashboard">
        <h1>Stat Cards</h1>
        <div className="empty-state">No active encounter. <Link to="/encounters">Go to Encounters</Link></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <h1>Stat Cards</h1>
        <div className="error-banner">Connection error: {error}. Is the backend running?</div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="dashboard">
        <h1>Stat Cards</h1>
        <div className="loading">Loading encounter...</div>
      </div>
    );
  }

  const statCardCombatants = state.combatants
    .filter(c => c.isMonster || c.isNpc)
    .slice()
    .sort((a, b) => a.turnOrder - b.turnOrder);

  const statCardGroups = groupStatCardCombatants(statCardCombatants);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-titles">
          <h1>Stat Cards</h1>
          <div className="subtitle">Dungeon Master's Ledger</div>
        </div>
        <Link to="/gm" className="btn btn-secondary">← Back to Table</Link>
      </header>

      <ActionBar state={state} onAction={refresh}>
        <button className="btn btn-secondary" onClick={() => setShowHealthDialog(true)}>
          ♥ Player Health
        </button>
      </ActionBar>

      {showHealthDialog && (
        <PlayerHealthDialog
          players={state.combatants.filter(c => !c.isMonster && !c.isNpc)}
          onClose={() => setShowHealthDialog(false)}
          onSaved={refresh}
        />
      )}

      <div className="stat-cards-layout">
        <div>
          {statCardCombatants.length === 0 ? (
            <div className="empty-state">No monsters or NPCs in this encounter yet.</div>
          ) : (
            <div className="stat-cards-grid">
              {statCardGroups.map(members => (
                <CombatantStatCard
                  key={members[0].id}
                  members={members}
                  isActive={members.some(m => m.id === state.activeTurnId)}
                  onUpdate={refresh}
                />
              ))}
            </div>
          )}
          <Link to={`/monster-creator?forEncounter=${state.id}`} className="btn btn-secondary stat-cards-add-btn">
            + Add Monster/NPC
          </Link>
        </div>
        <SimpleTurnOrder combatants={state.combatants} activeTurnId={state.activeTurnId} currentRound={state.currentRound} onUpdate={refresh} />
      </div>
    </div>
  );
}
