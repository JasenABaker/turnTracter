import { Link } from 'react-router-dom';
import StatBlockBody from './StatBlockBody';

export default function MonsterPreviewDialog({ monster, onClose, onAddToEncounter }) {
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog dialog-wide" onClick={e => e.stopPropagation()}>
        <div className="dialog-title">{monster.name}</div>
        <div className="dialog-body">
          <StatBlockBody monster={monster} fullDescriptions />
        </div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <Link to={`/monster-creator?edit=${monster.id}`} className="btn btn-secondary">Edit</Link>
          <button className="btn btn-primary" onClick={onAddToEncounter}>+ Add to Encounter</button>
        </div>
      </div>
    </div>
  );
}
