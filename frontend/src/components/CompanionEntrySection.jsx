import { useState } from 'react';
import { addCompanionEntry, updateCompanionEntry, deleteCompanionEntry } from '../api/api';
import EditableCell from './EditableCell';

export default function CompanionEntrySection({ title, category, companionId, entries, onUpdate }) {
  const isAction = category === 'action';

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newRange, setNewRange] = useState('');
  const [newHitOrDc, setNewHitOrDc] = useState('');
  const [newDamage, setNewDamage] = useState('');

  const resetNewEntry = () => {
    setNewName('');
    setNewDesc('');
    setNewRange('');
    setNewHitOrDc('');
    setNewDamage('');
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addCompanionEntry(companionId, {
      category,
      name: newName,
      description: newDesc,
      range: isAction ? newRange : null,
      hitOrDc: isAction ? newHitOrDc : null,
      damage: isAction ? newDamage : null,
    });
    resetNewEntry();
    setAdding(false);
    onUpdate();
  };

  const handleDelete = async (entryId) => {
    await deleteCompanionEntry(companionId, entryId);
    onUpdate();
  };

  const handleFieldSave = async (entryId, field, value) => {
    await updateCompanionEntry(companionId, entryId, { [field]: value });
    onUpdate();
  };

  const singular = title.endsWith('s') ? title.slice(0, -1) : title;

  return (
    <div className="entry-section">
      <h4 className="entry-section-title">{title}</h4>
      {entries.length === 0 && !adding && (
        <div className="empty-state entry-empty">None</div>
      )}
      {entries.map(entry => (
        <div key={entry.id} className="entry-row">
          <span className="entry-name">
            <EditableCell type="text" value={entry.name} onSave={val => handleFieldSave(entry.id, 'name', val)} />
          </span>
          <span className="entry-description">
            <EditableCell type="text" value={entry.description} onSave={val => handleFieldSave(entry.id, 'description', val)} />
          </span>
          {isAction && (
            <>
              <span className="entry-range" title="Range">
                <EditableCell type="text" value={entry.range || ''} onSave={val => handleFieldSave(entry.id, 'range', val)} />
              </span>
              <span className="entry-hit-or-dc" title="Hit / DC">
                <EditableCell type="text" value={entry.hitOrDc || ''} onSave={val => handleFieldSave(entry.id, 'hitOrDc', val)} />
              </span>
              <span className="entry-damage" title="Damage">
                <EditableCell type="text" value={entry.damage || ''} onSave={val => handleFieldSave(entry.id, 'damage', val)} />
              </span>
            </>
          )}
          <button className="btn btn-danger btn-xs" onClick={() => handleDelete(entry.id)} title={`Remove ${singular}`}>
            ✕
          </button>
        </div>
      ))}
      {adding ? (
        <div className="entry-row entry-row-new">
          <input
            className="input input-sm"
            placeholder="Name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            autoFocus
          />
          <input
            className="input"
            placeholder="Description"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
          />
          {isAction && (
            <>
              <input
                className="input input-sm"
                placeholder="Range (e.g. 5 ft.)"
                value={newRange}
                onChange={e => setNewRange(e.target.value)}
              />
              <input
                className="input input-sm"
                placeholder="Hit / DC (e.g. +4)"
                value={newHitOrDc}
                onChange={e => setNewHitOrDc(e.target.value)}
              />
              <input
                className="input input-sm"
                placeholder="Damage (e.g. 1 slashing)"
                value={newDamage}
                onChange={e => setNewDamage(e.target.value)}
              />
            </>
          )}
          <button className="btn btn-primary btn-xs" onClick={handleAdd}>Add</button>
          <button className="btn btn-ghost btn-xs" onClick={() => { setAdding(false); resetNewEntry(); }}>Cancel</button>
        </div>
      ) : (
        <button className="btn btn-sm btn-ghost" onClick={() => setAdding(true)}>+ Add {singular}</button>
      )}
    </div>
  );
}
