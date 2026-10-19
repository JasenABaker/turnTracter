import ConditionToggleGrid from './ConditionToggleGrid';

export default function AddConditionDialog({ combatant, onClose, onSaved }) {
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-title">Add Condition — {combatant.name}</div>
        <div className="dialog-body">
          <ConditionToggleGrid combatant={combatant} onSaved={onSaved} />
        </div>
        <div className="dialog-actions">
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
