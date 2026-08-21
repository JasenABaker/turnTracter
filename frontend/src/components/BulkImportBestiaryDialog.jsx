import { useState } from 'react';
import { importAllFromBestiary } from '../api/api';

export default function BulkImportBestiaryDialog({ onClose }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleStart = async () => {
    setBusy(true);
    setError('');
    try {
      const data = await importAllFromBestiary();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Import failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dialog-backdrop" onClick={busy ? undefined : onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-title">Import from Bestiary</div>
        <div className="dialog-body">
          {!result && !busy && (
            <p>
              Imports every monster from the open 5e SRD bestiary into your Compendium.
              Monsters already present by name are skipped — safe to run more than once.
            </p>
          )}
          {busy && <p>Importing… this can take a minute.</p>}
          {error && <div className="form-error">{error}</div>}
          {result && (
            <div>
              <p>
                Imported <strong>{result.imported}</strong>, skipped <strong>{result.skipped}</strong> already present.
              </p>
              {result.failed.length > 0 && (
                <p>
                  Couldn't import {result.failed.length}: {result.failed.join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="dialog-actions">
          {!result && (
            <button className="btn btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          )}
          {!result ? (
            <button className="btn btn-primary" onClick={handleStart} disabled={busy}>
              {busy ? 'Importing…' : 'Start Import'}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          )}
        </div>
      </div>
    </div>
  );
}
