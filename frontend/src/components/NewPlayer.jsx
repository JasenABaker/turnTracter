import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { createPlayer, updatePlayer, getPlayer, previewDndBeyondCharacter } from '../api/api';
import ImageUploadField from './ImageUploadField';

export default function NewPlayer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/encounters';
  const editId = searchParams.get('edit');

  const [mode, setMode] = useState('manual');
  const [name, setName] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [maxHp, setMaxHp] = useState('');
  const [armorClass, setArmorClass] = useState('');
  const [passivePerception, setPassivePerception] = useState('');
  const [strength, setStrength] = useState('');
  const [dexterity, setDexterity] = useState('');
  const [constitution, setConstitution] = useState('');
  const [intelligence, setIntelligence] = useState('');
  const [wisdom, setWisdom] = useState('');
  const [charisma, setCharisma] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [characterUrl, setCharacterUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  const toIntOrNull = v => (v === '' ? null : parseInt(v, 10));
  const toStr = v => (v === null || v === undefined ? '' : String(v));

  useEffect(() => {
    if (!editId) return;
    getPlayer(editId)
      .then(p => {
        setName(p.name || '');
        setClassLevel(p.classLevel || '');
        setImageUrl(p.imageUrl || '');
        setMaxHp(toStr(p.maxHp));
        setArmorClass(toStr(p.armorClass));
        setPassivePerception(toStr(p.passivePerception));
        setStrength(toStr(p.strength));
        setDexterity(toStr(p.dexterity));
        setConstitution(toStr(p.constitution));
        setIntelligence(toStr(p.intelligence));
        setWisdom(toStr(p.wisdom));
        setCharisma(toStr(p.charisma));
      })
      .catch(err => setError(err.message || 'Failed to load player'));
  }, [editId]);

  const handleImport = async () => {
    setImporting(true);
    setImportError('');
    try {
      const preview = await previewDndBeyondCharacter(characterUrl);
      setName(preview.name);
      setClassLevel(preview.classLevel || '');
      setImageUrl(preview.imageUrl || '');
      setMaxHp(String(preview.hp));
      setArmorClass(String(preview.armorClass));
      setStrength(String(preview.strength));
      setDexterity(String(preview.dexterity));
      setConstitution(String(preview.constitution));
      setIntelligence(String(preview.intelligence));
      setWisdom(String(preview.wisdom));
      setCharisma(String(preview.charisma));
      setMode('manual');
    } catch (err) {
      setImportError(err.message || 'Failed to import character');
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name,
        classLevel: classLevel || null,
        imageUrl: imageUrl || null,
        maxHp: parseInt(maxHp, 10),
        armorClass: parseInt(armorClass, 10),
        passivePerception: toIntOrNull(passivePerception),
        strength: toIntOrNull(strength),
        dexterity: toIntOrNull(dexterity),
        constitution: toIntOrNull(constitution),
        intelligence: toIntOrNull(intelligence),
        wisdom: toIntOrNull(wisdom),
        charisma: toIntOrNull(charisma),
      };
      if (editId) {
        await updatePlayer(editId, payload);
      } else {
        await createPlayer(payload);
      }
      navigate(returnTo);
    } catch (err) {
      setError(err.message || 'Failed to save player');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-titles">
          <h1>{editId ? `Edit — ${name || 'Player'}` : 'Add Player'}</h1>
          <div className="subtitle">Create a reusable player character (initiative is rolled per encounter)</div>
        </div>
      </header>

      <div className="mode-toggle">
        <button
          className={`btn btn-sm ${mode === 'manual' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setMode('manual')}
        >
          Manual Entry
        </button>
        <button
          className={`btn btn-sm ${mode === 'dndbeyond' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setMode('dndbeyond')}
        >
          Import from D&amp;D Beyond
        </button>
      </div>

      {mode === 'dndbeyond' ? (
        <div className="add-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="D&D Beyond character URL"
              value={characterUrl}
              onChange={e => setCharacterUrl(e.target.value)}
              className="input"
            />
          </div>
          {importError && <div className="form-error">{importError}</div>}
          <button
            type="button"
            className="btn btn-primary"
            disabled={importing || !characterUrl}
            onClick={handleImport}
          >
            {importing ? 'Fetching…' : 'Fetch Character'}
          </button>
        </div>
      ) : (
        <form className="add-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="field">
              <label>Character Name</label>
              <input className="input" placeholder="Aria Nightsong" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Class / Level</label>
              <input className="input" placeholder="Rogue 5" value={classLevel} onChange={e => setClassLevel(e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Image URL</label>
              <ImageUploadField value={imageUrl} onChange={setImageUrl} />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Max HP</label>
              <input type="number" className="input" placeholder="40" value={maxHp} onChange={e => setMaxHp(e.target.value)} required min="1" />
            </div>
            <div className="field">
              <label>Armor Class</label>
              <input type="number" className="input" placeholder="16" value={armorClass} onChange={e => setArmorClass(e.target.value)} required min="1" />
            </div>
            <div className="field">
              <label>Passive Perception</label>
              <input type="number" className="input" placeholder="14" value={passivePerception} onChange={e => setPassivePerception(e.target.value)} min="0" />
            </div>
          </div>

          <div className="ability-input-label-row">Ability Scores (optional)</div>
          <div className="form-row ability-input-row">
            {[
              ['STR', strength, setStrength, '10'],
              ['DEX', dexterity, setDexterity, '16'],
              ['CON', constitution, setConstitution, '13'],
              ['INT', intelligence, setIntelligence, '12'],
              ['WIS', wisdom, setWisdom, '10'],
              ['CHA', charisma, setCharisma, '14'],
            ].map(([label, val, setter, placeholder]) => (
              <div key={label} className="field">
                <label>{label}</label>
                <input type="number" className="input" placeholder={placeholder} value={val} onChange={e => setter(e.target.value)} min="1" />
              </div>
            ))}
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="creator-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : editId ? 'Save Changes' : 'Save Player'}
            </button>
            <Link to={returnTo} className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      )}
    </div>
  );
}
