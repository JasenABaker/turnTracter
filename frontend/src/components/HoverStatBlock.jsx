import { useState, useRef, useCallback, useEffect } from 'react';
import StatBlockBody from './StatBlockBody';

const SHOW_DELAY_MS = 300;
const HIDE_DELAY_MS = 100;
const POPOVER_WIDTH = 360;

export default function HoverStatBlock({ monster, children, className }) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);

  const handleMouseEnter = useCallback((e) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    showTimerRef.current = setTimeout(() => {
      setPosition({
        top: rect.bottom + 8,
        left: Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 16),
      });
      setVisible(true);
    }, SHOW_DELAY_MS);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current);
    hideTimerRef.current = setTimeout(() => setVisible(false), HIDE_DELAY_MS);
  }, []);

  useEffect(() => () => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  return (
    <span className={`stat-hover-trigger ${className || ''}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {visible && (
        <div
          className="stat-hover-popover dialog dialog-wide"
          style={{ position: 'fixed', top: position.top, left: position.left }}
          onMouseEnter={() => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); }}
          onMouseLeave={() => setVisible(false)}
        >
          <div className="dialog-title">{monster.name}</div>
          <div className="dialog-body">
            <StatBlockBody monster={monster} maskUnknown={false} />
          </div>
        </div>
      )}
    </span>
  );
}
