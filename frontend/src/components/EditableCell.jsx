import { useState } from 'react';

export default function EditableCell({ value, onSave, type = 'number', min }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    setEditing(false);
    let parsed = type === 'number' ? parseInt(editValue, 10) : editValue;
    const isValid = type === 'number' ? !isNaN(parsed) : true;
    if (isValid && type === 'number' && min !== undefined) {
      parsed = Math.max(min, parsed);
    }
    if (parsed !== value && isValid) {
      onSave(parsed);
    }
  };

  if (editing) {
    return (
      <input
        type={type}
        value={editValue}
        min={min}
        onChange={e => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
        autoFocus
        className="cell-input"
      />
    );
  }

  return (
    <span className="editable-cell" onClick={() => { setEditValue(value); setEditing(true); }}>
      {value}
    </span>
  );
}
