export default function HpBar({ currentHp, maxHp, mini }) {
  const ratio = maxHp > 0 ? Math.max(0, currentHp / maxHp) : 0;
  const percent = Math.round(ratio * 100);

  let fillClass;
  if (ratio <= 0.25) fillClass = 'hp-fill-danger';
  else if (ratio <= 0.5) fillClass = 'hp-fill-warn';
  else fillClass = 'hp-fill-healthy';

  return (
    <div className={`hp-bar-container ${mini ? 'hp-bar-mini' : ''}`}>
      <div className="hp-track">
        <div className={`hp-fill ${fillClass}`} style={{ width: `${percent}%` }} />
      </div>
      {!mini && <span className="hp-bar-text">{currentHp} / {maxHp}</span>}
    </div>
  );
}
