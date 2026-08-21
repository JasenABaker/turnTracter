import { Link } from 'react-router-dom';

export default function SplashPage() {
  return (
    <div className="splash">
      <div className="splash-topbar">
        <span>Turn Tracker</span>
        <span>A Tabletop Initiative Ledger</span>
      </div>

      <div className="splash-icon-ring">
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.6">
          <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
          <path d="M13 19l6-6" />
          <path d="M16 16l4 4" />
          <path d="M19 21l2-2" />
          <path d="M9.5 6.5L11 5" />
        </svg>
      </div>

      <div className="splash-heading">
        <h1>Turn Tracker</h1>
        <div className="splash-tagline">The Dungeon Master's Ledger for initiative, HP, and turns</div>
      </div>

      <hr className="hr splash-hr" />

      <div className="splash-actions">
        <Link to="/encounters" className="btn btn-primary splash-btn">Encounters</Link>
        <Link to="/player" className="btn splash-btn splash-btn-outline">Player Display</Link>
        <Link to="/players/new" className="btn splash-btn splash-btn-outline">New Player</Link>
        <Link to="/players" className="btn splash-btn splash-btn-outline">Player Compendium</Link>
        <Link to="/monster-creator" className="btn splash-btn splash-btn-outline">New Monster/NPC</Link>
        <Link to="/compendium" className="btn splash-btn splash-btn-outline">Compendium</Link>
        <Link to="/companions" className="btn splash-btn splash-btn-outline">Companions</Link>
        <Link to="/companion-tracker" className="btn splash-btn splash-btn-outline">Companion Tracker</Link>
      </div>

      <div className="splash-caption">Round tracking · HP &amp; AC · Death saves · Turn timer</div>
    </div>
  );
}
