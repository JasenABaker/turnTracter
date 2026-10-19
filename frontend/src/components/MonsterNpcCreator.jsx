import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getCombatant, addPlayer, addMonster, importMonsterFromDndBeyond, updateCombatantStatBlock } from '../api/api';
import ImageUploadField from './ImageUploadField';
import CombatantEntrySection from './CombatantEntrySection';

const splitTags = (s) => s.split(',').map(t => t.trim()).filter(Boolean);
const joinTags = (arr) => (arr || []).join(', ');

const ENTRY_SECTIONS = [
  ['trait', 'Traits'],
  ['action', 'Actions'],
  ['bonus-action', 'Bonus Actions'],
  ['reaction', 'Reactions'],
  ['legendary-action', 'Legendary Actions'],
  ['lair-action', 'Lair Actions'],
];

const blankForm = {
  name: '', isMonster: true, isNpc: false, initiativeScore: '',
  imageUrl: '', size: '', creatureType: '', alignment: '',
  hp: '', armorClass: '', speed: '',
  strength: '10', dexterity: '10', constitution: '10', intelligence: '10', wisdom: '10', charisma: '10',
  damageImmunities: '', damageResistances: '', damageVulnerabilities: '', conditionImmunities: '',
  senses: '', languages: '', challengeRating: '',
};

function formFromCombatant(c) {
  return {
    name: c.name || '',
    isMonster: !!c.isMonster,
    isNpc: !!c.isNpc,
    initiativeScore: String(c.initiativeScore ?? ''),
    imageUrl: c.imageUrl || '',
    size: c.size || '',
    creatureType: c.creatureType || '',
    alignment: c.alignment || '',
    hp: String(c.hp ?? ''),
    armorClass: String(c.armorClass ?? ''),
    speed: c.speed || '',
    strength: String(c.strength ?? 10),
    dexterity: String(c.dexterity ?? 10),
    constitution: String(c.constitution ?? 10),
    intelligence: String(c.intelligence ?? 10),
    wisdom: String(c.wisdom ?? 10),
    charisma: String(c.charisma ?? 10),
    damageImmunities: joinTags(c.damageImmunities),
    damageResistances: joinTags(c.damageResistances),
    damageVulnerabilities: joinTags(c.damageVulnerabilities),
    conditionImmunities: joinTags(c.conditionImmunities),
    senses: c.senses || '',
    languages: c.languages || '',
    challengeRating: c.challengeRating || '',
  };
}

export default function MonsterNpcCreator() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');
  const forEncounterId = searchParams.get('forEncounter');
  const returnTo = searchParams.get('returnTo') || '/stat-cards';

  const [mode, setMode] = useState('manual');
  const [form, setForm] = useState(blankForm);
  const [combatant, setCombatant] = useState(null);
  const [bestiaryName, setBestiaryName] = useState('');
  const [dndBeyondUrl, setDndBeyondUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const editUrlFor = (id) => {
    const params = new URLSearchParams({ edit: id });
    if (forEncounterId) params.set('forEncounter', forEncounterId);
    if (searchParams.get('returnTo')) params.set('returnTo', searchParams.get('returnTo'));
    return `/monster-creator?${params.toString()}`;
  };

  useEffect(() => {
    if (!editId) return;
    getCombatant(editId)
      .then(c => {
        setCombatant(c);
        setForm(formFromCombatant(c));
      })
      .catch(err => setError(err.message || 'Failed to load combatant'));
  }, [editId]);

  const setField = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const refreshCombatant = async () => {
    if (!combatant) return;
    const updated = await getCombatant(combatant.id);
    setCombatant(updated);
  };

  const statBlockPayload = () => ({
    name: form.name,
    imageUrl: form.imageUrl || null,
    size: form.size || null,
    creatureType: form.creatureType || null,
    alignment: form.alignment || null,
    challengeRating: form.isMonster ? (form.challengeRating || null) : null,
    speed: form.speed || null,
    strength: parseInt(form.strength, 10),
    dexterity: parseInt(form.dexterity, 10),
    constitution: parseInt(form.constitution, 10),
    intelligence: parseInt(form.intelligence, 10),
    wisdom: parseInt(form.wisdom, 10),
    charisma: parseInt(form.charisma, 10),
    damageImmunities: splitTags(form.damageImmunities),
    damageResistances: splitTags(form.damageResistances),
    damageVulnerabilities: splitTags(form.damageVulnerabilities),
    conditionImmunities: splitTags(form.conditionImmunities),
    senses: form.senses || null,
    languages: form.languages || null,
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const created = await addPlayer({
        name: form.name,
        imageUrl: form.imageUrl || null,
        initiativeScore: forEncounterId ? parseInt(form.initiativeScore, 10) : 0,
        hp: parseInt(form.hp, 10),
        armorClass: parseInt(form.armorClass, 10),
        isNpc: form.isNpc,
        isMonster: form.isMonster,
        encounterId: forEncounterId || null,
      });
      const withStatBlock = await updateCombatantStatBlock(created.id, statBlockPayload());
      setCombatant(withStatBlock);
      navigate(editUrlFor(created.id), { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to create combatant');
    } finally {
      setLoading(false);
    }
  };

  const handleBestiaryFetch = async () => {
    setLoading(true);
    setError('');
    try {
      const initiative = forEncounterId ? (parseInt(form.initiativeScore, 10) || 10) : null;
      const created = await addMonster(bestiaryName, initiative, forEncounterId || null);
      setCombatant(created);
      setForm(formFromCombatant(created));
      navigate(editUrlFor(created.id), { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to import creature');
    } finally {
      setLoading(false);
    }
  };

  const handleDndBeyondFetch = async () => {
    setLoading(true);
    setError('');
    try {
      const initiative = forEncounterId ? (parseInt(form.initiativeScore, 10) || 10) : null;
      const created = await importMonsterFromDndBeyond(dndBeyondUrl, initiative, forEncounterId || null);
      setCombatant(created);
      setForm(formFromCombatant(created));
      navigate(editUrlFor(created.id), { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to import creature');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStatBlock = async () => {
    if (!combatant) return;
    setLoading(true);
    setError('');
    setSaved(false);
    try {
      const updated = await updateCombatantStatBlock(combatant.id, statBlockPayload());
      setCombatant(updated);
      setSaved(true);
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!combatant;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-titles">
          <h1>{isEditing ? `Edit — ${combatant.name}` : 'Add Monster / NPC'}</h1>
          <div className="subtitle">Create or edit a combatant stat block</div>
        </div>
        <Link to={returnTo} className="btn btn-secondary">← Back</Link>
      </header>

      {!isEditing && (
        <div className="mode-toggle">
          <button
            className={`btn btn-sm ${mode === 'manual' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setMode('manual')}
          >
            Manual Entry
          </button>
          <button
            className={`btn btn-sm ${mode === 'bestiary' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setMode('bestiary')}
          >
            Import from Bestiary
          </button>
          <button
            className={`btn btn-sm ${mode === 'dndbeyond' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setMode('dndbeyond')}
          >
            Import from D&amp;D Beyond
          </button>
        </div>
      )}

      {!isEditing && mode === 'bestiary' && (
        <div className="add-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Monster name (e.g. Goblin)"
              className="input"
              value={bestiaryName}
              onChange={e => setBestiaryName(e.target.value)}
            />
            {forEncounterId && (
              <input
                type="number"
                placeholder="Initiative"
                className="input input-sm"
                value={form.initiativeScore}
                onChange={setField('initiativeScore')}
              />
            )}
          </div>
          {error && <div className="form-error">{error}</div>}
          <button
            type="button"
            className="btn btn-primary"
            disabled={loading || !bestiaryName || (forEncounterId && !form.initiativeScore)}
            onClick={handleBestiaryFetch}
          >
            {loading ? 'Fetching…' : 'Fetch'}
          </button>
        </div>
      )}

      {!isEditing && mode === 'dndbeyond' && (
        <div className="add-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="D&D Beyond monster URL (e.g. https://www.dndbeyond.com/monsters/16907-goblin)"
              className="input"
              value={dndBeyondUrl}
              onChange={e => setDndBeyondUrl(e.target.value)}
            />
            {forEncounterId && (
              <input
                type="number"
                placeholder="Initiative"
                className="input input-sm"
                value={form.initiativeScore}
                onChange={setField('initiativeScore')}
              />
            )}
          </div>
          {error && <div className="form-error">{error}</div>}
          <button
            type="button"
            className="btn btn-primary"
            disabled={loading || !dndBeyondUrl || (forEncounterId && !form.initiativeScore)}
            onClick={handleDndBeyondFetch}
          >
            {loading ? 'Fetching…' : 'Fetch'}
          </button>
        </div>
      )}

      {(isEditing || mode === 'manual') && (
        <form className="add-form" onSubmit={isEditing ? (e => { e.preventDefault(); handleSaveStatBlock(); }) : handleCreate}>
          <div className="form-row">
            <div className="field">
              <label>Name</label>
              <input className="input" value={form.name} onChange={setField('name')} required />
            </div>
            <div className="field">
              <label>Type</label>
              <select
                className="input"
                value={form.isMonster ? 'monster' : 'npc'}
                disabled={isEditing}
                onChange={e => setForm(f => ({ ...f, isMonster: e.target.value === 'monster', isNpc: e.target.value === 'npc' }))}
              >
                <option value="monster">Monster</option>
                <option value="npc">NPC</option>
              </select>
            </div>
            {!isEditing && forEncounterId && (
              <div className="field">
                <label>Initiative</label>
                <input type="number" className="input" value={form.initiativeScore} onChange={setField('initiativeScore')} required />
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="field">
              <label>Image URL</label>
              <ImageUploadField value={form.imageUrl} onChange={url => setForm(f => ({ ...f, imageUrl: url }))} />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Size</label>
              <input className="input" placeholder="Large" value={form.size} onChange={setField('size')} />
            </div>
            <div className="field">
              <label>Type</label>
              <input className="input" placeholder="giant" value={form.creatureType} onChange={setField('creatureType')} />
            </div>
            <div className="field">
              <label>Alignment</label>
              <input className="input" placeholder="chaotic evil" value={form.alignment} onChange={setField('alignment')} />
            </div>
            {form.isMonster && (
              <div className="field">
                <label>Challenge Rating</label>
                <input className="input" placeholder="5" value={form.challengeRating} onChange={setField('challengeRating')} />
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="field">
              <label>Max HP</label>
              <input
                type="number"
                className="input"
                value={form.hp}
                onChange={setField('hp')}
                required={!isEditing}
                disabled={isEditing}
                min="1"
              />
            </div>
            <div className="field">
              <label>Armor Class</label>
              <input
                type="number"
                className="input"
                value={form.armorClass}
                onChange={setField('armorClass')}
                required={!isEditing}
                disabled={isEditing}
                min="1"
              />
            </div>
            <div className="field">
              <label>Speed</label>
              <input className="input" placeholder="40 ft." value={form.speed} onChange={setField('speed')} />
            </div>
          </div>
          {isEditing && (
            <div className="text-muted" style={{ fontSize: 12, marginTop: '-8px' }}>
              HP, AC, and Initiative are tracked live on the GM Dashboard once a combatant exists.
            </div>
          )}

          <div className="ability-input-label-row">Ability Scores</div>
          <div className="form-row ability-input-row">
            {[
              ['STR', 'strength'], ['DEX', 'dexterity'], ['CON', 'constitution'],
              ['INT', 'intelligence'], ['WIS', 'wisdom'], ['CHA', 'charisma'],
            ].map(([label, field]) => (
              <div key={field} className="field">
                <label>{label}</label>
                <input type="number" className="input" value={form[field]} onChange={setField(field)} min="1" />
              </div>
            ))}
          </div>

          <div className="form-row">
            <div className="field">
              <label>Damage Immunities (comma-separated)</label>
              <input className="input" value={form.damageImmunities} onChange={setField('damageImmunities')} />
            </div>
            <div className="field">
              <label>Damage Resistances (comma-separated)</label>
              <input className="input" value={form.damageResistances} onChange={setField('damageResistances')} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Damage Vulnerabilities (comma-separated)</label>
              <input className="input" value={form.damageVulnerabilities} onChange={setField('damageVulnerabilities')} />
            </div>
            <div className="field">
              <label>Condition Immunities (comma-separated)</label>
              <input className="input" value={form.conditionImmunities} onChange={setField('conditionImmunities')} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Senses</label>
              <input className="input" placeholder="darkvision 60 ft." value={form.senses} onChange={setField('senses')} />
            </div>
            <div className="field">
              <label>Languages</label>
              <input className="input" value={form.languages} onChange={setField('languages')} />
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}
          {saved && <div className="form-success">Saved.</div>}

          <div className="creator-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Monster / NPC'}
            </button>
            <Link to={returnTo} className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      )}

      {isEditing && (
        <>
          <hr className="hr" />
          <div className="entries-editor">
            {ENTRY_SECTIONS.map(([category, title]) => (
              <CombatantEntrySection
                key={category}
                title={title}
                category={category}
                combatantId={combatant.id}
                entries={combatant.entries.filter(e => e.category === category)}
                onUpdate={refreshCombatant}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
