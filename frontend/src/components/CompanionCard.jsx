import { useState } from 'react';
import { Link } from 'react-router-dom';
import { updateCompanion, deleteCompanion } from '../api/api';
import EditableCell from './EditableCell';
import AbilityScoreGrid from './AbilityScoreGrid';
import TagListEditor from './TagListEditor';
import CompanionEntrySection from './CompanionEntrySection';
import ImageUploadField from './ImageUploadField';

const ENTRY_SECTIONS = [
  ['trait', 'Traits'],
  ['action', 'Actions'],
  ['bonus-action', 'Bonus Actions'],
  ['reaction', 'Reactions'],
];

export default function CompanionCard({ companion, onUpdate, onDeleted }) {
  const [open, setOpen] = useState(false);

  const saveField = (field, value) => {
    updateCompanion(companion.id, { [field]: value }).then(onUpdate);
  };

  const saveTagList = (field, values) => {
    updateCompanion(companion.id, { [field]: values }).then(onUpdate);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    await deleteCompanion(companion.id);
    onDeleted();
  };

  const totalAc = companion.armorClass + (companion.tempAc || 0);

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
        <span className="btn btn-ghost btn-sm" onClick={handleDelete} title="Remove companion">✕</span>
      </button>

      {open && (
        <div className="add-form-container companion-stat-block">
          <div className="form-row companion-identity-row">
            {companion.imageUrl && <img src={companion.imageUrl} alt="" className="active-combatant-img companion-portrait" />}
            <div className="companion-identity-fields">
              <label className="companion-field-label">
                Name
                <EditableCell type="text" value={companion.name} onSave={val => saveField('name', val)} />
              </label>
              <label className="companion-field-label">
                Image URL
                <ImageUploadField value={companion.imageUrl || ''} onChange={val => saveField('imageUrl', val)} />
              </label>
              <label className="companion-field-label">
                Speed
                <EditableCell type="text" value={companion.speed || ''} onSave={val => saveField('speed', val)} />
              </label>
            </div>
          </div>

          <div className="form-row companion-vitals-row">
            <div className="tag tag-neutral">
              Max HP: <EditableCell value={companion.maxHp} min={1} onSave={val => saveField('maxHp', val)} />
            </div>
            <div className="tag tag-neutral">
              Armor Class: <EditableCell value={companion.armorClass} min={1} onSave={val => saveField('armorClass', val)} />
            </div>
          </div>
          <div className="companion-tracker-hint">
            Current HP, Temp HP, and Bonus AC are tracked on the <Link to="/companion-tracker">Tracker</Link> screen.
          </div>

          <AbilityScoreGrid companion={companion} onSave={saveField} />

          <div className="form-row companion-tags-row">
            <TagListEditor label="Damage Immunities" tags={companion.damageImmunities} onChange={v => saveTagList('damageImmunities', v)} />
            <TagListEditor label="Damage Resistances" tags={companion.damageResistances} onChange={v => saveTagList('damageResistances', v)} />
          </div>
          <div className="form-row companion-tags-row">
            <TagListEditor label="Damage Vulnerabilities" tags={companion.damageVulnerabilities} onChange={v => saveTagList('damageVulnerabilities', v)} />
            <TagListEditor label="Condition Immunities" tags={companion.conditionImmunities} onChange={v => saveTagList('conditionImmunities', v)} />
          </div>

          <div className="form-row">
            <label className="companion-field-label">
              Senses
              <EditableCell type="text" value={companion.senses || ''} onSave={val => saveField('senses', val)} />
            </label>
            <label className="companion-field-label">
              Languages
              <EditableCell type="text" value={companion.languages || ''} onSave={val => saveField('languages', val)} />
            </label>
          </div>

          {ENTRY_SECTIONS.map(([category, title]) => (
            <CompanionEntrySection
              key={category}
              title={title}
              category={category}
              companionId={companion.id}
              entries={companion.entries.filter(entry => entry.category === category)}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
