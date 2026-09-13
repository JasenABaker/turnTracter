import { Link } from 'react-router-dom';
import AbilityScoreGrid from './AbilityScoreGrid';

const ENTRY_LABELS = [
  ['trait', 'Trait'],
  ['action', 'Action'],
  ['bonus-action', 'Bonus'],
  ['reaction', 'Reaction'],
  ['legendary-action', 'Legendary'],
  ['lair-action', 'Lair'],
];

export default function MonsterPreviewDialog({ monster, onClose, onAddToEncounter }) {
  const entries = monster.entries || [];
  const attackEntries = entries.filter(e => e.category === 'action' && e.hitOrDc);

  const subtitleParts = [monster.size, monster.creatureType].filter(Boolean);
  const subtitle = subtitleParts.join(' ') + (monster.isNpc ? ' · NPC' : monster.challengeRating ? ` · CR ${monster.challengeRating}` : '');

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog dialog-wide" onClick={e => e.stopPropagation()}>
        <div className="dialog-title">{monster.name}</div>
        <div className="dialog-body">
          {monster.imageUrl ? (
            <img src={monster.imageUrl} alt="" className="stat-block-portrait plate" />
          ) : (
            <div className="stat-block-portrait placeholder-img plate">
              <span>{monster.name.charAt(0)}</span>
            </div>
          )}
          {subtitle.trim() && <div className="stat-card-subtitle">{subtitle}</div>}
          <div className="stat-card-vitals">
            <span><strong>AC</strong> {monster.unknownAc ? '?' : monster.armorClass}</span>
            <span><strong>HP</strong> {monster.unknownHp ? '?' : monster.hp}</span>
            {monster.speed && <span><strong>Speed</strong> {monster.speed}</span>}
          </div>

          <div className="stat-card-abilities">
            <AbilityScoreGrid companion={monster} readOnly />
          </div>

          {attackEntries.length > 0 && (
            <div className="table-container">
              <table className="table stat-card-attack-table">
                <thead><tr><th>Attack</th><th>Range</th><th>Hit</th><th>Dmg</th></tr></thead>
                <tbody>
                  {attackEntries.map(e => (
                    <tr key={e.id}><td>{e.name}</td><td>{e.range || '—'}</td><td>{e.hitOrDc}</td><td>{e.damage || '—'}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="stat-card-entries">
            {ENTRY_LABELS.map(([category, label]) => {
              const names = entries.filter(e => e.category === category).map(e => e.name);
              if (names.length === 0) return null;
              return (
                <div className="stat-card-entry-line" key={category}>
                  <strong>{label}</strong> {names.join(', ')}
                </div>
              );
            })}
          </div>
        </div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <Link to={`/monster-creator?edit=${monster.id}`} className="btn btn-secondary">Edit</Link>
          <button className="btn btn-primary" onClick={onAddToEncounter}>+ Add to Encounter</button>
        </div>
      </div>
    </div>
  );
}
