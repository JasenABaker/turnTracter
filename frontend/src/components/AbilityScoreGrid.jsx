import EditableCell from './EditableCell';

const ABILITIES = [
  ['strength', 'STR'],
  ['dexterity', 'DEX'],
  ['constitution', 'CON'],
  ['intelligence', 'INT'],
  ['wisdom', 'WIS'],
  ['charisma', 'CHA'],
];

const modifier = (score) => {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
};

export default function AbilityScoreGrid({ companion, onSave, readOnly = false }) {
  return (
    <div className="ability-grid">
      {ABILITIES.map(([field, label]) => (
        <div key={field} className="ability-box">
          <div className="ability-label">{label}</div>
          {readOnly ? (
            <div className="ability-score">{companion[field]}</div>
          ) : (
            <EditableCell value={companion[field]} min={1} onSave={val => onSave(field, val)} />
          )}
          <div className="ability-mod">{modifier(companion[field])}</div>
        </div>
      ))}
    </div>
  );
}
