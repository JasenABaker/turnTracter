import { useState } from 'react';
import { createCompanion, importCompanionFromBestiary } from '../api/api';
import ImageUploadField from './ImageUploadField';

const splitTags = (s) => s.split(',').map(t => t.trim()).filter(Boolean);

export default function AddCompanionForm({ onAdded }) {
  const [mode, setMode] = useState('manual');
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [maxHp, setMaxHp] = useState('');
  const [armorClass, setArmorClass] = useState('');
  const [speed, setSpeed] = useState('');
  const [strength, setStrength] = useState('10');
  const [dexterity, setDexterity] = useState('10');
  const [constitution, setConstitution] = useState('10');
  const [intelligence, setIntelligence] = useState('10');
  const [wisdom, setWisdom] = useState('10');
  const [charisma, setCharisma] = useState('10');
  const [damageImmunities, setDamageImmunities] = useState('');
  const [damageResistances, setDamageResistances] = useState('');
  const [damageVulnerabilities, setDamageVulnerabilities] = useState('');
  const [conditionImmunities, setConditionImmunities] = useState('');
  const [senses, setSenses] = useState('');
  const [languages, setLanguages] = useState('');
  const [bestiaryName, setBestiaryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setName(''); setImageUrl(''); setMaxHp(''); setArmorClass(''); setSpeed('');
    setStrength('10'); setDexterity('10'); setConstitution('10');
    setIntelligence('10'); setWisdom('10'); setCharisma('10');
    setDamageImmunities(''); setDamageResistances(''); setDamageVulnerabilities(''); setConditionImmunities('');
    setSenses(''); setLanguages(''); setBestiaryName(''); setError('');
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createCompanion({
        name,
        imageUrl: imageUrl || null,
        maxHp: parseInt(maxHp, 10),
        armorClass: parseInt(armorClass, 10),
        speed,
        strength: parseInt(strength, 10),
        dexterity: parseInt(dexterity, 10),
        constitution: parseInt(constitution, 10),
        intelligence: parseInt(intelligence, 10),
        wisdom: parseInt(wisdom, 10),
        charisma: parseInt(charisma, 10),
        damageImmunities: splitTags(damageImmunities),
        damageResistances: splitTags(damageResistances),
        damageVulnerabilities: splitTags(damageVulnerabilities),
        conditionImmunities: splitTags(conditionImmunities),
        senses,
        languages,
      });
      resetForm();
      onAdded();
    } catch (err) {
      setError(err.message || 'Failed to add companion');
    } finally {
      setLoading(false);
    }
  };

  const handleBestiaryImport = async () => {
    setLoading(true);
    setError('');
    try {
      await importCompanionFromBestiary(bestiaryName);
      resetForm();
      onAdded();
    } catch (err) {
      setError(err.message || 'Failed to import creature');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-form-container">
      <h3>Add Companion</h3>
      <div className="mode-toggle">
        <button
          className={`btn btn-sm ${mode === 'manual' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => { setMode('manual'); resetForm(); }}
        >
          Manual Entry
        </button>
        <button
          className={`btn btn-sm ${mode === 'bestiary' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => { setMode('bestiary'); resetForm(); }}
        >
          Import from Bestiary
        </button>
      </div>

      {mode === 'bestiary' ? (
        <div className="add-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Creature name (e.g. Wolf)"
              value={bestiaryName}
              onChange={e => setBestiaryName(e.target.value)}
              className="input"
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button
            type="button"
            className="btn btn-primary"
            disabled={loading || !bestiaryName}
            onClick={handleBestiaryImport}
          >
            {loading ? 'Importing...' : 'Import Creature'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="add-form">
          <div className="form-row">
            <div className="field">
              <label>Companion Name</label>
              <input
                type="text"
                placeholder="Whisper"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="input"
              />
            </div>
            <div className="field">
              <label>Image URL (optional)</label>
              <ImageUploadField value={imageUrl} onChange={setImageUrl} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Max HP</label>
              <input
                type="number"
                value={maxHp}
                onChange={e => setMaxHp(e.target.value)}
                required
                min="1"
                className="input"
              />
            </div>
            <div className="field">
              <label>Armor Class</label>
              <input
                type="number"
                value={armorClass}
                onChange={e => setArmorClass(e.target.value)}
                required
                min="1"
                className="input"
              />
            </div>
            <div className="field">
              <label>Speed</label>
              <input
                type="text"
                placeholder="10 ft., fly 60 ft."
                value={speed}
                onChange={e => setSpeed(e.target.value)}
                className="input"
              />
            </div>
          </div>
          <div className="ability-input-label-row">Ability Scores</div>
          <div className="form-row ability-input-row">
            {[
              ['STR', strength, setStrength],
              ['DEX', dexterity, setDexterity],
              ['CON', constitution, setConstitution],
              ['INT', intelligence, setIntelligence],
              ['WIS', wisdom, setWisdom],
              ['CHA', charisma, setCharisma],
            ].map(([label, val, setter]) => (
              <div key={label} className="field">
                <label>{label}</label>
                <input
                  type="number"
                  value={val}
                  onChange={e => setter(e.target.value)}
                  className="input"
                  min="1"
                />
              </div>
            ))}
          </div>
          <div className="form-row">
            <div className="field">
              <label>Damage Immunities (comma-separated)</label>
              <input
                type="text"
                value={damageImmunities}
                onChange={e => setDamageImmunities(e.target.value)}
                className="input"
              />
            </div>
            <div className="field">
              <label>Damage Resistances (comma-separated)</label>
              <input
                type="text"
                value={damageResistances}
                onChange={e => setDamageResistances(e.target.value)}
                className="input"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Damage Vulnerabilities (comma-separated)</label>
              <input
                type="text"
                value={damageVulnerabilities}
                onChange={e => setDamageVulnerabilities(e.target.value)}
                className="input"
              />
            </div>
            <div className="field">
              <label>Condition Immunities (comma-separated)</label>
              <input
                type="text"
                value={conditionImmunities}
                onChange={e => setConditionImmunities(e.target.value)}
                className="input"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Senses</label>
              <input
                type="text"
                placeholder="darkvision 120 ft."
                value={senses}
                onChange={e => setSenses(e.target.value)}
                className="input"
              />
            </div>
            <div className="field">
              <label>Languages</label>
              <input
                type="text"
                placeholder="—"
                value={languages}
                onChange={e => setLanguages(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Companion'}
          </button>
        </form>
      )}
    </div>
  );
}
