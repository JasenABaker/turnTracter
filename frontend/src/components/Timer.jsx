import { useState, useEffect } from 'react';

export default function Timer({ timerStartTime, isTimerPaused, pausedElapsedSeconds, turnDurationSeconds, large }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (isTimerPaused) return;
    const interval = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(interval);
  }, [isTimerPaused]);

  if (!timerStartTime) {
    return (
      <div className={`timer ${large ? 'timer-lg' : ''}`}>
        <span className="timer-display">--:--</span>
      </div>
    );
  }

  let elapsed;
  if (isTimerPaused) {
    elapsed = pausedElapsedSeconds || 0;
  } else {
    elapsed = Math.floor((now - new Date(timerStartTime).getTime()) / 1000);
  }

  const timerDisabled = !turnDurationSeconds || turnDurationSeconds === 0;

  if (timerDisabled) {
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return (
      <div className={`timer ${large ? 'timer-lg' : ''} ${isTimerPaused ? 'timer-paused' : ''}`}>
        <span className="timer-display">{display}</span>
        <span className="timer-label">{isTimerPaused ? 'PAUSED' : 'ELAPSED'}</span>
      </div>
    );
  }

  const remaining = Math.max(0, turnDurationSeconds - elapsed);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isCritical = remaining > 0 && remaining <= 5;
  const isExpired = remaining === 0 && elapsed > 0;

  return (
    <div className={`timer ${large ? 'timer-lg' : ''} ${isCritical ? 'timer-critical' : ''} ${isExpired ? 'timer-expired' : ''} ${isTimerPaused ? 'timer-paused' : ''}`}>
      <span className="timer-display">{isExpired ? "TIME'S UP" : display}</span>
      {isTimerPaused && <span className="timer-label">PAUSED</span>}
    </div>
  );
}
