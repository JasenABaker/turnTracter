import { nextTurn, previousTurn, toggleTimer, updateTimerSettings } from '../api/api';

const TIMER_PRESETS = [
  { label: 'Off', value: 0 },
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
];

export default function ActionBar({ state, onAction }) {
  const handleNext = async () => {
    await nextTurn();
    onAction();
  };

  const handlePrevious = async () => {
    await previousTurn();
    onAction();
  };

  const handleToggleTimer = async () => {
    await toggleTimer(!state.isTimerPaused);
    onAction();
  };

  const handleTimerChange = async (e) => {
    const seconds = parseInt(e.target.value, 10);
    await updateTimerSettings(seconds);
    onAction();
  };

  const timerDisabled = !state.turnDurationSeconds || state.turnDurationSeconds === 0;

  return (
    <div className="action-bar">
      <button className="btn btn-secondary" onClick={handlePrevious} title="Previous Turn">
        ◀ Previous
      </button>
      <button className="btn btn-primary" onClick={handleNext} title="Next Turn">
        Next ▶
      </button>
      <button
        className={`btn ${state.isTimerPaused ? 'btn-success' : 'btn-warning'}`}
        onClick={handleToggleTimer}
      >
        {state.isTimerPaused ? '▶ Resume Timer' : '⏸ Pause Timer'}
      </button>
      <select
        className="timer-select"
        value={state.turnDurationSeconds || 0}
        onChange={handleTimerChange}
        title="Turn timer duration"
      >
        {TIMER_PRESETS.map(p => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
    </div>
  );
}
