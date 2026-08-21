import { useState } from 'react';
import { addPlayer, addMonster, previewDndBeyondCharacter } from '../api/api';
import ImageUploadField from './ImageUploadField';

export default function AddCombatantForm({ onAdded, encounterId }) {
  const [mode, setMode] = useState('player');
  const [name, setName] = useState('');
  const [initiative, setInitiative] = useState('');
  const [hp, setHp] = useState('');
  const [ac, setAc] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isNpc, setIsNpc] = useState(false);
  const [unknownHp, setUnknownHp] = useState(false);
  const [unknownAc, setUnknownAc] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [sameInitiative, setSameInitiative] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [characterUrl, setCharacterUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  const resetForm = () => {
    setName('');
    setInitiative('');
    setHp('');
    setAc('');
    setImageUrl('');
    setIsNpc(false);
    setUnknownHp(false);
    setUnknownAc(false);
    setQuantity('1');
    setSameInitiative(true);
    setError('');
    setCharacterUrl('');
    setImportError('');
  };

  const handleImport = async () => {
    setImporting(true);
    setImportError('');
    try {
      const preview = await previewDndBeyondCharacter(characterUrl);
      setName(preview.name);
      setHp(String(preview.hp));
      setAc(String(preview.armorClass));
      setImageUrl(preview.imageUrl || '');
      setMode('player');
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
      const count = Math.max(1, parseInt(quantity, 10) || 1);
      const baseInitiative = initiative ? parseInt(initiative, 10) : null;

      if (mode === 'player') {
        await addPlayer({
          name,
          imageUrl: imageUrl || null,
          initiativeScore: parseInt(initiative, 10),
          hp: parseInt(hp, 10),
          armorClass: parseInt(ac, 10),
          isNpc,
          isMonster: false,
          encounterId,
        });
      } else if (mode === 'custom-monster') {
        for (let i = 0; i < count; i++) {
          const suffix = count > 1 ? ` ${i + 1}` : '';
          await addPlayer({
            name: name + suffix,
            imageUrl: imageUrl || null,
            initiativeScore: sameInitiative ? baseInitiative : baseInitiative,
            hp: unknownHp ? 0 : parseInt(hp, 10),
            armorClass: unknownAc ? 0 : parseInt(ac, 10),
            isNpc: false,
            isMonster: true,
            unknownHp,
            unknownAc,
            encounterId,
          });
        }
      } else {
        for (let i = 0; i < count; i++) {
          const suffix = count > 1 ? ` ${i + 1}` : '';
          await addMonster(name + suffix, sameInitiative ? baseInitiative : baseInitiative, encounterId);
        }
      }
      resetForm();
      onAdded();
    } catch (err) {
      setError(err.message || 'Failed to add combatant');
    } finally {
      setLoading(false);
    }
  };

  const showStatFields = mode === 'player' || mode === 'custom-monster';
  const showQuantity = mode === 'custom-monster' || mode === 'monster';

  return (
    <div className="add-form-container">
      <h3>Add Combatant</h3>
      <div className="mode-toggle">
        <button
          className={`btn btn-sm ${mode === 'player' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => { setMode('player'); resetForm(); }}
        >
          Player / NPC
        </button>
        <button
          className={`btn btn-sm ${mode === 'custom-monster' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => { setMode('custom-monster'); resetForm(); }}
        >
          Custom Monster
        </button>
        <button
          className={`btn btn-sm ${mode === 'monster' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => { setMode('monster'); resetForm(); }}
        >
          Monster Lookup
        </button>
        <button
          className={`btn btn-sm ${mode === 'dndbeyond' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => { setMode('dndbeyond'); resetForm(); }}
        >
          Import D&D Beyond
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
            {importing ? 'Fetching...' : 'Fetch Character'}
          </button>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="add-form">
        <div className="form-row">
          <input
            type="text"
            placeholder={mode === 'monster' ? 'Monster name (e.g. Goblin)' : mode === 'custom-monster' ? 'Monster name' : 'Character name'}
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="input"
          />
          <input
            type="number"
            placeholder="Initiative"
            value={initiative}
            onChange={e => setInitiative(e.target.value)}
            required={showStatFields}
            className="input input-sm"
          />
          {showQuantity && (
            <input
              type="number"
              placeholder="Qty"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              min="1"
              max="20"
              className="input input-xs"
            />
          )}
        </div>

        {showStatFields && (
          <>
            <div className="form-row">
              <input
                type="number"
                placeholder="Hit Points"
                value={hp}
                onChange={e => setHp(e.target.value)}
                required={!(mode === 'custom-monster' && unknownHp)}
                disabled={mode === 'custom-monster' && unknownHp}
                min="1"
                className="input input-sm"
              />
              <input
                type="number"
                placeholder="Armor Class"
                value={ac}
                onChange={e => setAc(e.target.value)}
                required={!(mode === 'custom-monster' && unknownAc)}
                disabled={mode === 'custom-monster' && unknownAc}
                min="1"
                className="input input-sm"
              />
              <ImageUploadField value={imageUrl} onChange={setImageUrl} placeholder="Image URL (optional)" />
            </div>
            {mode === 'player' && (
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isNpc}
                  onChange={e => setIsNpc(e.target.checked)}
                />
                NPC
              </label>
            )}
            {mode === 'custom-monster' && (
              <>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={unknownHp}
                    onChange={e => setUnknownHp(e.target.checked)}
                  />
                  Unknown HP
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={unknownAc}
                    onChange={e => setUnknownAc(e.target.checked)}
                  />
                  Unknown AC
                </label>
              </>
            )}
          </>
        )}

        {error && <div className="form-error">{error}</div>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Adding...' : `Add ${mode === 'player' ? 'Player' : 'Monster'}${showQuantity && parseInt(quantity) > 1 ? ` (×${quantity})` : ''}`}
        </button>
      </form>
      )}
    </div>
  );
}
