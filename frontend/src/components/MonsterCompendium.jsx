import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCombatantTemplates } from '../api/api';
import MonsterPreviewDialog from './MonsterPreviewDialog';
import EncounterPickerDialog from './EncounterPickerDialog';
import AddToEncounterDialog from './AddToEncounterDialog';
import BulkImportBestiaryDialog from './BulkImportBestiaryDialog';

const CR_ORDER = ['0', '1/8', '1/4', '1/2', ...Array.from({ length: 30 }, (_, i) => String(i + 1))];

function compareCr(a, b) {
  return CR_ORDER.indexOf(a) - CR_ORDER.indexOf(b);
}

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

export default function MonsterCompendium() {
  const [query, setQuery] = useState('');
  const [crFilter, setCrFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [templates, setTemplates] = useState(null);
  const [previewMonster, setPreviewMonster] = useState(null);
  const [addFlowMonster, setAddFlowMonster] = useState(null);
  const [addFlowEncounter, setAddFlowEncounter] = useState(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getCombatantTemplates(query)
      .then(data => { if (!cancelled) setTemplates(data); })
      .catch(() => { if (!cancelled) setTemplates([]); });
    return () => { cancelled = true; };
  }, [query, refreshKey]);

  const startAddToEncounter = (monster) => {
    setPreviewMonster(null);
    setAddFlowMonster(monster);
  };

  const crOptions = templates
    ? [...new Set(templates.map(t => t.challengeRating).filter(Boolean))].sort(compareCr)
    : [];
  const typeOptions = templates
    ? [...new Set(templates.map(t => t.creatureType).filter(Boolean))].sort()
    : [];

  const filteredTemplates = templates
    ? templates.filter(t =>
        (!crFilter || t.challengeRating === crFilter) &&
        (!typeFilter || t.creatureType === typeFilter))
    : [];

  const groups = groupByLetter(filteredTemplates);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-titles">
          <h1>Monster Compendium</h1>
          <div className="subtitle">All created monsters &amp; NPCs, A–Z</div>
        </div>
        <div className="compendium-header-actions">
          <button className="btn btn-secondary" onClick={() => setShowBulkImport(true)}>Import from Bestiary</button>
          <Link to="/monster-creator" className="btn btn-primary">+ New Monster / NPC</Link>
        </div>
      </header>

      <div className="compendium-filters">
        <input
          type="text"
          className="input"
          placeholder="Search compendium…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ maxWidth: 420 }}
        />
        <select className="input" value={crFilter} onChange={e => setCrFilter(e.target.value)} style={{ maxWidth: 140 }}>
          <option value="">All CR</option>
          {crOptions.map(cr => <option key={cr} value={cr}>CR {cr}</option>)}
        </select>
        <select className="input" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">All Types</option>
          {typeOptions.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      {templates === null ? (
        <div className="loading">Loading...</div>
      ) : groups.length === 0 ? (
        <div className="empty-state">No monsters or NPCs found.</div>
      ) : (
        <div className="compendium-list">
          {groups.map(group => (
            <div key={group.letter}>
              <div className="compendium-letter">{group.letter}</div>
              {group.items.map(monster => (
                <div key={monster.id} className="compendium-row" onClick={() => setPreviewMonster(monster)}>
                  <span className="compendium-row-name">{monster.name}</span>
                  <span className={`tag ${monster.isMonster ? 'tag-neutral' : 'tag-plain'}`}>
                    {monster.isMonster ? 'Monster' : 'NPC'}
                  </span>
                  <span className="compendium-row-meta">CR {monster.challengeRating || '—'}</span>
                  <span className="compendium-row-meta">
                    AC {monster.unknownAc ? '?' : monster.armorClass} · HP {monster.unknownHp ? '?' : monster.hp}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={e => { e.stopPropagation(); startAddToEncounter(monster); }}
                  >
                    + Add to Encounter
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {previewMonster && (
        <MonsterPreviewDialog
          monster={previewMonster}
          onClose={() => setPreviewMonster(null)}
          onAddToEncounter={() => startAddToEncounter(previewMonster)}
        />
      )}

      {addFlowMonster && !addFlowEncounter && (
        <EncounterPickerDialog
          title={`Add ${addFlowMonster.name} to Encounter`}
          onSelect={setAddFlowEncounter}
          onCancel={() => setAddFlowMonster(null)}
        />
      )}

      {addFlowMonster && addFlowEncounter && (
        <AddToEncounterDialog
          monster={addFlowMonster}
          encounter={addFlowEncounter}
          onDone={() => { setAddFlowMonster(null); setAddFlowEncounter(null); }}
          onCancel={() => { setAddFlowMonster(null); setAddFlowEncounter(null); }}
        />
      )}

      {showBulkImport && (
        <BulkImportBestiaryDialog
          onClose={() => { setShowBulkImport(false); setRefreshKey(k => k + 1); }}
        />
      )}
    </div>
  );
}
