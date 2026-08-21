import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

const VIEWS = [
  ['/encounters', 'Encounters'],
  ['/compendium', 'Monster Compendium'],
  ['/players', 'Player Compendium'],
  ['/gm', 'GM Dashboard'],
  ['/player', 'Player Display'],
  ['/stat-cards', 'Stat Cards'],
  ['/companions', 'Companions'],
  ['/companion-tracker', 'Companion Tracker'],
];

function ViewsDropdown() {
  const [open, setOpen] = useState(false);

  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setOpen(false);
    }
  };

  return (
    <div className="views-dropdown" tabIndex={-1} onBlur={handleBlur}>
      <button
        type="button"
        className="views-dropdown-trigger"
        onClick={() => setOpen(o => !o)}
      >
        Views ▾
      </button>
      {open && (
        <div className="views-dropdown-menu">
          {VIEWS.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className="views-dropdown-item"
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AppLayout() {
  return (
    <>
      <nav className="nav">
        <Link to="/" className="nav-brand">Turn Tracker</Link>
        <ViewsDropdown />
      </nav>
      <Outlet />
    </>
  );
}
