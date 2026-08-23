import { useState } from 'react';

export default function AddTemplateCountDialog({ template, onConfirm, onCancel }) {
  const [count, setCount] = useState('1');
  const [unknownHp, setUnknownHp] = useState(false);
  const [unknownAc, setUnknownAc] = useState(false);
  const parsed = Math.max(1, Math.min(20, parseInt(count, 10) || 1));

  const confirm = () => onConfirm(parsed, unknownHp, unknownAc);

  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-title">Add {template.name}</div>
        <div className="dialog-body">
          <div className="field">
            <label>How many?</label>
            <input
              type="number"
              className="input"
              min="1"
              max="20"
              value={count}
              onChange={e => setCount(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirm(); }}
              autoFocus
            />
          </div>
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
        </div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={confirm}>
            {parsed > 1 ? `Add ×${parsed}` : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
