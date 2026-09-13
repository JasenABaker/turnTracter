import { useState } from 'react';

const DIE_TYPES = [4, 6, 8, 10, 12, 20];

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

export default function DiceRollerDrawer() {
  const [open, setOpen] = useState(false);
  const [sides, setSides] = useState(20);
  const [count, setCount] = useState(1);
  const [results, setResults] = useState(null);

  const roll = () => {
    const rolls = Array.from({ length: count }, () => rollDie(sides));
    setResults({ sides, count, rolls, sum: rolls.reduce((a, b) => a + b, 0) });
  };

  return (
    <>
      <button
        type="button"
        className="dice-fab"
        onClick={() => setOpen(o => !o)}
        aria-label="Open dice roller"
      >
        🎲
      </button>

      <div className={`dice-drawer ${open ? 'dice-drawer-open' : ''}`}>
        <div className="dice-drawer-header">
          <span className="dice-drawer-title">Dice Roller</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOpen(false)}>Close</button>
        </div>

        <div className="dice-drawer-body">
          <div className="dice-drawer-chips">
            {DIE_TYPES.map(d => (
              <button
                key={d}
                type="button"
                className={`dice-chip ${sides === d ? 'dice-chip-selected' : ''}`}
                onClick={() => setSides(d)}
              >
                d{d}
              </button>
            ))}
          </div>

          <div className="dice-drawer-count">
            <label htmlFor="dice-count">Number of dice</label>
            <input
              id="dice-count"
              type="number"
              className="input"
              min={1}
              max={100}
              value={count}
              onChange={e => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
            />
          </div>

          <button type="button" className="btn btn-primary dice-roll-btn" onClick={roll}>
            Roll {count}d{sides}
          </button>

          {results && (
            <div className="dice-results">
              <div className="dice-results-label">
                Result of {results.count}d{results.sides}
              </div>
              <div className="dice-results-rolls">
                {results.rolls.map((r, i) => (
                  <span key={i} className="dice-result-pill">{r}</span>
                ))}
              </div>
              <div className="dice-results-sum">Sum: <strong>{results.sum}</strong></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
