import AbilityScoreGrid from './AbilityScoreGrid';

const ENTRY_LABELS = [
  ['trait', 'Trait'],
  ['action', 'Action'],
  ['bonus-action', 'Bonus'],
  ['reaction', 'Reaction'],
  ['legendary-action', 'Legendary'],
  ['lair-action', 'Lair'],
];

const ENTRY_SECTIONS = [
  ['trait', 'Traits'],
  ['action', 'Actions'],
  ['bonus-action', 'Bonus Actions'],
  ['reaction', 'Reactions'],
  ['legendary-action', 'Legendary Actions'],
  ['lair-action', 'Lair Actions'],
];

export default function StatBlockBody({ monster, maskUnknown = true, fullDescriptions = false }) {
  const entries = monster.entries || [];
  const attackEntries = entries.filter(e => e.category === 'action' && e.hitOrDc);

  const subtitleParts = [monster.size, monster.creatureType].filter(Boolean);
  const subtitle = subtitleParts.join(' ') + (monster.isNpc ? ' · NPC' : monster.challengeRating ? ` · CR ${monster.challengeRating}` : '');

  const showAc = maskUnknown && monster.unknownAc ? '?' : monster.armorClass;
  const showHp = maskUnknown && monster.unknownHp ? '?' : monster.hp;

  return (
    <>
      {monster.imageUrl ? (
        <img src={monster.imageUrl} alt="" className="stat-block-portrait plate" />
      ) : (
        <div className="stat-block-portrait placeholder-img plate">
          <span>{monster.name.charAt(0)}</span>
        </div>
      )}
      {subtitle.trim() && <div className="stat-card-subtitle">{subtitle}</div>}
      <div className="stat-card-vitals">
        <span><strong>AC</strong> {showAc}</span>
        <span><strong>HP</strong> {showHp}</span>
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

      {fullDescriptions ? (
        <div className="stat-block-entries-full">
          {ENTRY_SECTIONS.map(([category, title]) => {
            const items = entries.filter(e => e.category === category);
            if (items.length === 0) return null;
            return (
              <div className="stat-block-section" key={category}>
                <h4>{title}</h4>
                {items.map(e => (
                  <p className="stat-block-entry" key={e.id}>
                    <strong className="stat-block-entry-name">{e.name}.</strong> {e.description}
                  </p>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
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
      )}
    </>
  );
}
