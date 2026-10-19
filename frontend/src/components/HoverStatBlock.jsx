import { useState, useRef, useCallback, useEffect } from 'react';
import StatBlockBody from './StatBlockBody';

const SHOW_DELAY_MS = 300;
const HIDE_DELAY_MS = 100;
const POPOVER_MARGIN = 16;

export default function HoverStatBlock({ monster, children, className, as: Tag = 'span', center = false, ...rest }) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);

  const handleMouseEnter = useCallback((e) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    // currentTarget may be `display: contents` (e.g. inside a flex header), which has no box
    // of its own — measure the first rendered child instead so positioning is always accurate.
    const rect = (e.currentTarget.firstElementChild || e.currentTarget).getBoundingClientRect();
    showTimerRef.current = setTimeout(() => {
      if (!center) {
        // Popover is nearly full-width (matches .action-bar/.dashboard content width), so just
        // pin it to a fixed side margin rather than aligning to the trigger's left edge.
        setPosition({ top: rect.bottom + 8, left: POPOVER_MARGIN });
      }
      setVisible(true);
    }, SHOW_DELAY_MS);
  }, [center]);

  const handleMouseLeave = useCallback(() => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current);
    hideTimerRef.current = setTimeout(() => setVisible(false), HIDE_DELAY_MS);
  }, []);

  useEffect(() => () => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  return (
    <Tag className={`stat-hover-trigger ${className || ''}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...rest}>
      {children}
      {visible && (
        <div
          className={`stat-hover-popover dialog dialog-wide ${center ? 'stat-hover-popover-centered' : ''}`}
          style={center ? undefined : { position: 'fixed', top: position.top, left: position.left }}
          onMouseEnter={() => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); }}
          onMouseLeave={() => setVisible(false)}
        >
          <div className="dialog-title">{monster.name}</div>
          <div className="dialog-body">
            <StatBlockBody monster={monster} maskUnknown={false} fullDescriptions />
          </div>
        </div>
      )}
    </Tag>
  );
}
