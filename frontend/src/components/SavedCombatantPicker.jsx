import { useState, useEffect } from 'react';
import { getSavedCombatants, deleteSavedCombatant, addPlayer } from '../api/api';

export default function SavedCombatantPicker({ onAdded }) {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);
  const [initiatives, setInitiatives] = useState({});

  const fetchSaved = async () => {
    try {
      const data = await getSavedCombatants();
      setSaved(data);
    } catch (e) {
      console.error('Failed to load saved combatants', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSaved(); }, []);

  const handleAdd = async (s) => {
    const init = parseInt(initiatives[s.id], 10);
    if (isNaN(init)) return;

    setAdding(s.id);
    try {
      await addPlayer({
        name: s.name,
        imageUrl: s.imageUrl,
        initiativeScore: init,
        hp: s.hp,
        armorClass: s.armorClass,
        isNpc: s.isNpc,
        isMonster: s.isMonster,
      });
      setInitiatives(prev => ({ ...prev, [s.id]: '' }));
      onAdded();
    } catch (e) {
      console.error('Failed to add saved combatant', e);
    } finally {
      setAdding(null);
    }
  };

  const handleDelete = async (id) => {
    await deleteSavedCombatant(id);
    setSaved(prev => prev.filter(s => s.id !== id));
  };

  if (loading) return <div className="loading">Loading saved combatants...</div>;
  if (saved.length === 0) return <div className="empty-state">No previously used combatants yet.</div>;

  const players = saved.filter(s => !s.isMonster && !s.isNpc);
  const npcs = saved.filter(s => s.isNpc);
  const monsters = saved.filter(s => s.isMonster);

  const renderGroup = (label, items) => {
    if (items.length === 0) return null;
    return (
      <div className="saved-group">
        <h4 className="saved-group-label">{label}</h4>
        <div className="saved-list">
          {items.map(s => (
            <div key={s.id} className="saved-item">
              <div className="saved-item-info">
                <span className="saved-item-name">{s.name}</span>
                <span className="saved-item-stats">HP: {s.hp} | AC: {s.armorClass}</span>
              </div>
              <div className="saved-item-actions">
                <input
                  type="number"
                  placeholder="Init"
                  value={initiatives[s.id] || ''}
                  onChange={e => setInitiatives(prev => ({ ...prev, [s.id]: e.target.value }))}
                  className="input input-xs"
                  onKeyDown={e => { if (e.key === 'Enter') handleAdd(s); }}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleAdd(s)}
                  disabled={adding === s.id || !initiatives[s.id]}
                  title="Add to encounter"
                >
                  +
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(s.id)}
                  title="Remove from saved"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="saved-combatants">
      {renderGroup('Players', players)}
      {renderGroup('NPCs', npcs)}
      {renderGroup('Monsters', monsters)}
    </div>
  );
}
