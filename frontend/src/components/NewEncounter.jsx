import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  createEncounter, getEncounter, renameEncounter,
  addPlayerToEncounter, addTemplateToEncounter, removeFromEncounterRoster,
  getPlayers, getCombatantTemplates,
} from '../api/api';
import SearchPicker from './SearchPicker';
import AddTemplateCountDialog from './AddTemplateCountDialog';

export default function NewEncounter() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);
  const [pendingCountTemplate, setPendingCountTemplate] = useState(null);

  const refreshDetail = () => {
    if (!id) return;
    getEncounter(id).then(setDetail).catch(err => setError(err.message || 'Failed to load encounter'));
  };

  useEffect(() => { refreshDetail(); }, [id]);

  const handleContinue = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const created = await createEncounter(name.trim());
      navigate(`/encounters/${created.id}/build`, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to create encounter');
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (e) => {
    const newName = e.target.value.trim();
    if (!newName || newName === detail.name) return;
    await renameEncounter(id, newName);
    refreshDetail();
  };

  const handleAddPlayer = async (player) => {
    await addPlayerToEncounter(id, player.id, null);
    refreshDetail();
  };

  const handleAddTemplate = (template) => {
    setPendingCountTemplate(template);
  };

  const handleConfirmAddCount = async (count, unknownHp, unknownAc) => {
    const template = pendingCountTemplate;
    setPendingCountTemplate(null);
    for (let i = 0; i < count; i++) {
      const name = count > 1 ? `${template.name} ${i + 1}` : null;
      await addTemplateToEncounter(id, template.id, null, name, unknownHp, unknownAc);
    }
    refreshDetail();
  };

  const handleRemove = async (combatantId) => {
    await removeFromEncounterRoster(id, combatantId);
    refreshDetail();
  };

  if (!id) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="header-titles">
            <h1>New Encounter</h1>
            <div className="subtitle">Assemble players and monsters/NPCs</div>
          </div>
        </header>
        <form className="add-form" onSubmit={handleContinue} style={{ maxWidth: 420 }}>
          <div className="field">
            <label>Encounter Name</label>
            <input
              className="input"
              placeholder="Ambush at Ravenwatch Bridge"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating…' : 'Continue'}
          </button>
        </form>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <h1>New Encounter</h1>
        <div className="form-error">{error}</div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="dashboard">
        <h1>New Encounter</h1>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const addedPlayerIds = detail.combatants.filter(c => c.sourcePlayerId).map(c => c.sourcePlayerId);
  const addedTemplateIds = detail.combatants.filter(c => c.sourceTemplateId).map(c => c.sourceTemplateId);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-titles">
          <h1>{detail.name}</h1>
          <div className="subtitle">Assemble players and monsters/NPCs</div>
        </div>
      </header>

      <div className="field" style={{ maxWidth: 420, marginBottom: 'var(--space-6)' }}>
        <label>Encounter Name</label>
        <input className="input" defaultValue={detail.name} onBlur={handleRename} />
      </div>

      <div className="encounter-build-panels">
        <div>
          <div className="panel-header-row">
            <h4>Add Players</h4>
            <Link to={`/players/new?returnTo=${encodeURIComponent(`/encounters/${id}/build`)}`}>+ Create new player</Link>
          </div>
          <SearchPicker
            fetchItems={getPlayers}
            placeholder="Search players…"
            renderItem={p => <span>{p.name}</span>}
            onSelect={handleAddPlayer}
            excludeIds={addedPlayerIds}
          />
        </div>
        <div>
          <div className="panel-header-row">
            <h4>Add Monsters / NPCs</h4>
            <Link to={`/monster-creator?returnTo=${encodeURIComponent(`/encounters/${id}/build`)}`}>+ Create new monster/NPC</Link>
          </div>
          <SearchPicker
            fetchItems={getCombatantTemplates}
            placeholder="Search monsters &amp; NPCs…"
            renderItem={c => (
              <span>
                {c.name}
                <span className={`tag ${c.isMonster ? 'tag-neutral' : 'tag-plain'}`} style={{ marginLeft: 6 }}>
                  {c.isMonster ? 'Monster' : 'NPC'}
                </span>
              </span>
            )}
            onSelect={handleAddTemplate}
            excludeIds={addedTemplateIds}
          />
        </div>
      </div>

      <hr className="hr" />
      <div className="encounter-added-label">Added to Encounter ({detail.combatants.length})</div>
      {detail.combatants.length === 0 ? (
        <div className="empty-state">Nothing added yet.</div>
      ) : (
        <div className="encounter-added-list">
          {detail.combatants.map(c => (
            <div key={c.id} className="encounter-added-row">
              <span>
                <span
                  className={`tag ${!c.isMonster && !c.isNpc ? 'tag-accent' : c.isMonster ? 'tag-neutral' : 'tag-plain'}`}
                  style={{ marginRight: 8 }}
                >
                  {!c.isMonster && !c.isNpc ? 'Player' : c.isMonster ? 'Monster' : 'NPC'}
                </span>
                {c.name}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => handleRemove(c.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="creator-actions" style={{ marginTop: 'var(--space-6)' }}>
        <button
          className="btn btn-primary"
          disabled={detail.combatants.length === 0}
          onClick={() => navigate(`/encounters/${id}/initiative`)}
        >
          Create &amp; Set Initiative
        </button>
        <Link to="/encounters" className="btn btn-secondary">Cancel</Link>
      </div>

      {pendingCountTemplate && (
        <AddTemplateCountDialog
          template={pendingCountTemplate}
          onConfirm={handleConfirmAddCount}
          onCancel={() => setPendingCountTemplate(null)}
        />
      )}
    </div>
  );
}
