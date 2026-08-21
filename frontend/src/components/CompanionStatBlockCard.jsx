import { useState } from 'react';
import { updateCompanionHp, updateCompanionTempAc } from '../api/api';
import EditableCell from './EditableCell';
import HpDeltaCell from './HpDeltaCell';
import HpBar from './HpBar';
import AbilityScoreGrid from './AbilityScoreGrid';

const ENTRY_SECTIONS = [
  ['trait', 'Traits'],
  ['action', 'Actions'],
  ['bonus-action', 'Bonus Actions'],
  ['reaction', 'Reactions'],
];

export default function CompanionStatBlockCard({ companion, onUpdate }) {
  const [open, setOpen] = useState(false);
  const totalAc = companion.armorClass + (companion.tempAc || 0);

  const traitLines = [
    ['Damage Immunities', companion.damageImmunities],
    ['Damage Resistances', companion.damageResistances],
    ['Damage Vulnerabilities', companion.damageVulnerabilities],
    ['Condition Immunities', companion.conditionImmunities],
  ].filter(([, values]) => values && values.length > 0);

  return (
    <div className="collapsible-section companion-card">
      <button
        className={`collapsible-header companion-summary ${open ? 'open-header' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span className={`collapse-arrow ${open ? 'open' : ''}`}>▶</span>
        {companion.imageUrl && <img src={companion.imageUrl} alt="" className="table-avatar" />}
        <span className="companion-summary-name">{companion.name}</span>
        <span className="companion-summary-stats">
          HP {companion.currentHp}/{companion.maxHp} · AC {totalAc}
        </span>
      </button>

      {open && (
        <div className="stat-block-panel">
          <div className="stat-block-grid">
            {companion.imageUrl ? (
              <img src={companion.imageUrl} alt="" className="stat-block-portrait plate" />
            ) : (
              <div className="stat-block-portrait placeholder-img plate">
                <span>{companion.name.charAt(0)}</span>
              </div>
            )}

            <div>
              <div className="stat-block-header">
                <h2 className="stat-block-name">{companion.name}</h2>
                <div className="stat-block-vitals">
                  <span>HP <strong>{companion.currentHp} / {companion.maxHp}</strong></span>
                  <span>AC <strong>{totalAc}</strong></span>
                </div>
              </div>

              {companion.speed && (
                <div className="stat-block-line">Speed {companion.speed}</div>
              )}

              <div className="stat-block-hp-line">
                <span className="stat-block-hp-editor">
                  <HpDeltaCell
                    currentHp={companion.currentHp}
                    maxHp={companion.maxHp}
                    tempHp={companion.tempHp}
                    onSave={data => updateCompanionHp(companion.id, data).then(onUpdate)}
                  />
                </span>
                <span className="stat-block-inline-editor">
                  Temp HP: <EditableCell value={companion.tempHp} min={0} onSave={val => updateCompanionHp(companion.id, { tempHp: val }).then(onUpdate)} />
                </span>
                <span className="stat-block-inline-editor">
                  Bonus AC: <EditableCell value={companion.tempAc || 0} min={0} onSave={val => updateCompanionTempAc(companion.id, val).then(onUpdate)} />
                </span>
              </div>

              <AbilityScoreGrid companion={companion} readOnly />

              <div className="tag-list" style={{ marginTop: 'var(--space-3)' }}>
                {traitLines.map(([label, values]) => (
                  <span className="tag tag-outline" key={label}>{label}: {values.join(', ')}</span>
                ))}
                {companion.senses && <span className="tag tag-outline">{companion.senses}</span>}
                <span className="tag tag-neutral">Languages {companion.languages || '—'}</span>
              </div>

              <hr className="hr" />

              {(() => {
                const actionEntries = companion.entries.filter(entry => entry.category === 'action');
                if (actionEntries.length === 0) return null;
                return (
                  <div className="stat-block-section actions-overview">
                    <h6>Actions Overview</h6>
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr><th>Attack</th><th>Range</th><th>Hit / DC</th><th>Damage</th></tr>
                        </thead>
                        <tbody>
                          {actionEntries.map(entry => (
                            <tr key={entry.id}>
                              <td>{entry.name}</td>
                              <td>{entry.range || '—'}</td>
                              <td>{entry.hitOrDc || '—'}</td>
                              <td>{entry.damage || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {ENTRY_SECTIONS.map(([category, title]) => {
                const entries = companion.entries.filter(entry => entry.category === category);
                if (entries.length === 0) return null;
                return (
                  <div className="stat-block-section" key={category}>
                    <h4>{title}</h4>
                    {entries.map(entry => (
                      <p className="stat-block-entry" key={entry.id}>
                        <strong className="stat-block-entry-name">{entry.name}.</strong> {entry.description}
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
