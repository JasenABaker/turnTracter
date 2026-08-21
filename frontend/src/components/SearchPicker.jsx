import { useState, useEffect } from 'react';

export default function SearchPicker({ fetchItems, renderItem, onSelect, placeholder = 'Search…', excludeIds }) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchItems(query)
      .then(data => { if (!cancelled) setItems(data); })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [query]);

  const excludeSet = excludeIds instanceof Set ? excludeIds : new Set(excludeIds || []);
  const visibleItems = items.filter(item => !excludeSet.has(item.id));

  const handleSelect = (item) => {
    onSelect(item);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="search-picker">
      <input
        type="text"
        className="input search-picker-input"
        placeholder={placeholder}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      />
      {open && (
        <div className="search-picker-list" onMouseDown={e => e.preventDefault()}>
          {loading ? (
            <div className="search-picker-empty">Loading…</div>
          ) : visibleItems.length === 0 ? (
            <div className="search-picker-empty">No matches</div>
          ) : (
            visibleItems.map(item => (
              <div key={item.id} className="search-picker-item" onClick={() => handleSelect(item)}>
                {renderItem(item)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
