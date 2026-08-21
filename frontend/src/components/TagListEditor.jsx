import { useState } from 'react';

export default function TagListEditor({ label, tags, onChange }) {
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    onChange([...tags, trimmed]);
    setNewTag('');
  };

  const removeTag = (index) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="tag-list-editor">
      <div className="tag-list-label">{label}</div>
      <div className="tag-list">
        {tags.map((tag, i) => (
          <span key={`${tag}-${i}`} className="tag tag-accent">
            {tag}
            <span className="tag-remove" onClick={() => removeTag(i)}>×</span>
          </span>
        ))}
        <input
          type="text"
          placeholder="+ add"
          value={newTag}
          onChange={e => setNewTag(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          onBlur={addTag}
          className="input input-xs tag-input"
        />
      </div>
    </div>
  );
}
