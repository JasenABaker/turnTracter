import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEncounterState } from '../hooks/useEncounterState';
import { resetEncounter, deleteEncounter, getCombatantTemplates, addTemplateToEncounter } from '../api/api';
import ActionBar from './ActionBar';
import AddCombatantForm from './AddCombatantForm';
import CombatantTable from './CombatantTable';
import SearchPicker from './SearchPicker';
import Timer from './Timer';

export default function GmDashboard() {
  const { state, error, noActiveEncounter, refresh } = useEncounterState(2000);
  const navigate = useNavigate();
  const [addFormOpen, setAddFormOpen] = useState(true);
  const [pendingTemplate, setPendingTemplate] = useState(null);
  const [pendingInitiative, setPendingInitiative] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  if (noActiveEncounter) {
    return (
      <div className="dashboard">
        <h1>GM Dashboard</h1>
        <div className="empty-state">No active encounter. <Link to="/encounters">Go to Encounters</Link></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <h1>GM Dashboard</h1>
        <div className="error-banner">Connection error: {error}. Is the backend running?</div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="dashboard">
        <h1>GM Dashboard</h1>
        <div className="loading">Loading encounter...</div>
      </div>
    );
  }

  const activeCombatant = state.combatants.find(c => c.id === state.activeTurnId);

  const handleAddTemplate = async () => {
    if (!pendingTemplate) return;
    await addTemplateToEncounter(state.id, pendingTemplate.id, parseInt(pendingInitiative, 10) || 0);
    setPendingTemplate(null);
    setPendingInitiative('');
    refresh();
  };

  const handleReset = async () => {
    await resetEncounter(state.id);
    setPendingAction(null);
    refresh();
  };

  const handleDelete = async () => {
    await deleteEncounter(state.id);
    navigate('/encounters');
  };

  const handleEndEncounter = async () => {
    await resetEncounter(state.id);
    navigate('/encounters');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-titles">
          <h1>GM Dashboard</h1>
          <div className="subtitle">Dungeon Master's Ledger</div>
        </div>
        <div className="header-stats">
          <Link to={`/encounters/${state.id}/build`} className="btn btn-secondary">Edit</Link>
          <Link to="/stat-cards" className="btn btn-secondary">Stat Cards</Link>
          <div className="round-circle">
            <span className="round-label">Round</span>
            <span className="round-number">{state.currentRound}</span>
          </div>
          {activeCombatant && (
            <div>
              <span className="active-name-label">Now Acting</span>
              <div className="active-name-value">{activeCombatant.name}</div>
            </div>
          )}
          {state.turnDurationSeconds > 0 && (
            <Timer
              timerStartTime={state.timerStartTime}
              isTimerPaused={state.isTimerPaused}
              pausedElapsedSeconds={state.pausedElapsedSeconds}
              turnDurationSeconds={state.turnDurationSeconds}
            />
          )}
        </div>
      </header>

      <ActionBar state={state} onAction={refresh} />
      <div className="collapsible-section">
        <button
          className={`btn btn-secondary collapsible-header ${addFormOpen ? 'open-header' : ''}`}
          onClick={() => setAddFormOpen(!addFormOpen)}
        >
          <span className={`collapse-arrow ${addFormOpen ? 'open' : ''}`}>▶</span>
          Add Combatant
        </button>
        {addFormOpen && <AddCombatantForm onAdded={refresh} encounterId={state.id} />}
      </div>

      <div className="template-search-section">
        <SearchPicker
          fetchItems={getCombatantTemplates}
          placeholder="Search previously used combatants…"
          renderItem={c => (
            <span>
              {c.name}
              <span className={`tag ${c.isMonster ? 'tag-neutral' : 'tag-plain'}`} style={{ marginLeft: 6 }}>
                {c.isMonster ? 'Monster' : 'NPC'}
              </span>
            </span>
          )}
          onSelect={setPendingTemplate}
        />
        {pendingTemplate && (
          <div className="template-add-row">
            <span>Add <strong>{pendingTemplate.name}</strong> — Initiative:</span>
            <input
              type="number"
              className="input input-sm"
              value={pendingInitiative}
              onChange={e => setPendingInitiative(e.target.value)}
              autoFocus
            />
            <button className="btn btn-primary btn-sm" onClick={handleAddTemplate}>Add</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setPendingTemplate(null)}>Cancel</button>
          </div>
        )}
      </div>

      <CombatantTable
        combatants={state.combatants}
        activeTurnId={state.activeTurnId}
        onUpdate={refresh}
      />
      <div className="clear-encounter-section">
        {!pendingAction ? (
          <div className="encounter-row-actions">
            <button className="btn btn-secondary" onClick={() => setPendingAction('reset')}>
              Reset Encounter
            </button>
            <button className="btn btn-danger" onClick={() => setPendingAction('delete')}>
              Delete Encounter
            </button>
            <button className="btn btn-primary" onClick={() => setPendingAction('end')}>
              End Encounter
            </button>
          </div>
        ) : (
          <div className="confirm-clear">
            <span>
              {pendingAction === 'reset' && 'Reset this encounter? This resets HP and status for all combatants and clears initiative.'}
              {pendingAction === 'delete' && 'Delete this encounter permanently? This cannot be undone.'}
              {pendingAction === 'end' && 'End this encounter? This resets HP and status for all combatants, clears initiative, and returns to Encounters.'}
            </span>
            <button
              className="btn btn-danger btn-sm"
              onClick={pendingAction === 'reset' ? handleReset : pendingAction === 'delete' ? handleDelete : handleEndEncounter}
            >
              Yes, {pendingAction === 'reset' ? 'Reset' : pendingAction === 'delete' ? 'Delete' : 'End'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setPendingAction(null)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
