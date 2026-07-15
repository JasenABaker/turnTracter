import { useState } from 'react';
import { useEncounterState } from '../hooks/useEncounterState';
import { clearEncounter } from '../api/api';
import ActionBar from './ActionBar';
import AddCombatantForm from './AddCombatantForm';
import CombatantTable from './CombatantTable';
import SavedCombatantPicker from './SavedCombatantPicker';
import Timer from './Timer';

export default function GmDashboard() {
  const { state, error, refresh } = useEncounterState(2000);
  const [addFormOpen, setAddFormOpen] = useState(true);
  const [savedOpen, setSavedOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  if (error) {
    return (
      <div className="dashboard">
        <h1 className="title">⚔ GM Dashboard</h1>
        <div className="error-banner">Connection error: {error}. Is the backend running?</div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="dashboard">
        <h1 className="title">⚔ GM Dashboard</h1>
        <div className="loading">Loading encounter...</div>
      </div>
    );
  }

  const activeCombatant = state.combatants.find(c => c.id === state.activeTurnId);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="title">⚔ GM Dashboard</h1>
        <div className="subtitle">Dungeon Master's Ledger</div>
        <div className="round-info">
          <div className="round-badge round-circle">
            <span className="round-label">Round</span>
            <span className="round-number">{state.currentRound}</span>
          </div>
          {activeCombatant && (
            <span className="active-name">Now Acting: <span className="active-name-value">{activeCombatant.name}</span></span>
          )}
        </div>
        <Timer
          timerStartTime={state.timerStartTime}
          isTimerPaused={state.isTimerPaused}
          pausedElapsedSeconds={state.pausedElapsedSeconds}
          turnDurationSeconds={state.turnDurationSeconds}
        />
      </header>

      <ActionBar state={state} onAction={refresh} />
      <div className="collapsible-section">
        <button
          className={`collapsible-header ${addFormOpen ? 'open-header' : ''}`}
          onClick={() => setAddFormOpen(!addFormOpen)}
        >
          <span className={`collapse-arrow ${addFormOpen ? 'open' : ''}`}>▶</span>
          Add Combatant
        </button>
        {addFormOpen && <AddCombatantForm onAdded={refresh} />}
      </div>
      <div className="collapsible-section">
        <button
          className={`collapsible-header ${savedOpen ? 'open-header' : ''}`}
          onClick={() => setSavedOpen(!savedOpen)}
        >
          <span className={`collapse-arrow ${savedOpen ? 'open' : ''}`}>▶</span>
          Previously Used Combatants
        </button>
        {savedOpen && <SavedCombatantPicker onAdded={refresh} />}
      </div>
      <CombatantTable
        combatants={state.combatants}
        activeTurnId={state.activeTurnId}
        onUpdate={refresh}
      />
      <div className="clear-encounter-section">
        {!confirmClear ? (
          <button className="btn btn-danger" onClick={() => setConfirmClear(true)}>
            🗑️ Clear Encounter
          </button>
        ) : (
          <div className="confirm-clear">
            <span>Are you sure? This will remove all combatants.</span>
            <button className="btn btn-danger btn-sm" onClick={async () => {
              await clearEncounter();
              setConfirmClear(false);
              refresh();
            }}>
              Yes, Clear
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setConfirmClear(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
