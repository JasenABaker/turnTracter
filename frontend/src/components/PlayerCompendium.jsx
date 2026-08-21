import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPlayers, deletePlayer } from '../api/api';
import EncounterPickerDialog from './EncounterPickerDialog';
import AddPlayerToEncounterDialog from './AddPlayerToEncounterDialog';

function groupByLetter(items) {
  const groups = [];
  let currentLetter = null;
  let currentGroup = null;
  for (const item of items) {
    const letter = (item.name[0] || '').toUpperCase();
    if (letter !== currentLetter) {
      currentLetter = letter;
      currentGroup = { letter, items: [] };
      groups.push(currentGroup);
    }
    currentGroup.items.push(item);
  }
  return groups;
}

export default function PlayerCompendium() {
  const [query, setQuery] = useState('');
  const [players, setPlayers] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [addFlowPlayer, setAddFlowPlayer] = useState(null);
  const [addFlowEncounter, setAddFlowEncounter] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getPlayers(query)
      .then(data => { if (!cancelled) setPlayers(data); })
      .catch(() => { if (!cancelled) setPlayers([]); });
    return () => { cancelled = true; };
  }, [query, refreshKey]);

  const handleDelete = async (id) => {
    await deletePlayer(id);
    setPendingDelete(null);
    setRefreshKey(k => k + 1);
  };

  const startAddToEncounter = (player) => {
    setAddFlowPlayer(player);
  };

  const groups = players ? groupByLetter(players) : [];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-titles">
          <h1>Player Compendium</h1>
          <div className="subtitle">All created players, A–Z</div>
        </div>
        <Link to="/players/new?returnTo=/players" className="btn btn-primary">+ New Player</Link>
      </header>

      <input
        type="text"
        className="input"
        placeholder="Search players…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ marginBottom: 'var(--space-6)', maxWidth: 420 }}
      />

      {players === null ? (
        <div className="loading">Loading...</div>
      ) : groups.length === 0 ? (
        <div className="empty-state">No players found.</div>
      ) : (
        <div className="compendium-list">
          {groups.map(group => (
            <div key={group.letter}>
              <div className="compendium-letter">{group.letter}</div>
              {group.items.map(player => (
                <div key={player.id} className="compendium-row">
                  <span className="compendium-row-name">{player.name}</span>
                  {player.classLevel && <span className="compendium-row-meta">{player.classLevel}</span>}
                  <span className="compendium-row-meta">AC {player.armorClass} · HP {player.maxHp}</span>

                  {pendingDelete === player.id ? (
                    <div className="confirm-clear">
                      <span>Delete this player permanently?</span>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(player.id)}>Yes, Delete</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setPendingDelete(null)}>Cancel</button>
                    </div>
                  ) : (
                    <div className="encounter-row-actions">
                      <Link to={`/players/new?edit=${player.id}&returnTo=/players`} className="btn btn-secondary btn-sm">Edit</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => setPendingDelete(player.id)}>Delete</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => startAddToEncounter(player)}>+ Add to Encounter</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {addFlowPlayer && !addFlowEncounter && (
        <EncounterPickerDialog
          title={`Add ${addFlowPlayer.name} to Encounter`}
          onSelect={setAddFlowEncounter}
          onCancel={() => setAddFlowPlayer(null)}
        />
      )}

      {addFlowPlayer && addFlowEncounter && (
        <AddPlayerToEncounterDialog
          player={addFlowPlayer}
          encounter={addFlowEncounter}
          onDone={() => { setAddFlowPlayer(null); setAddFlowEncounter(null); }}
          onCancel={() => { setAddFlowPlayer(null); setAddFlowEncounter(null); }}
        />
      )}
    </div>
  );
}
