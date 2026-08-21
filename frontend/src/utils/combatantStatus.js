export function getCombatantStatus(c) {
  if (c.manualDead) return { key: 'dead', label: '💀 Dead', className: 'tag tag-outline' };
  if (c.unknownHp) {
    if (c.manualBloodied) return { key: 'bloodied', label: '🩸 Bloodied', className: 'tag tag-accent' };
    return null;
  }
  if (c.currentHp <= 0) {
    if (c.isMonster) return { key: 'dead', label: '💀 Dead', className: 'tag tag-outline' };
    if (c.deathSaveFailures >= 3) return { key: 'dead', label: '💀 Dead', className: 'tag tag-outline' };
    if (c.deathSaveSuccesses >= 3) return { key: 'stable', label: '💤 Stable', className: 'tag tag-neutral' };
    return { key: 'unconscious', label: '😵 Unconscious', className: 'tag tag-outline' };
  }
  if (c.isBloodied) return { key: 'bloodied', label: '🩸 Bloodied', className: 'tag tag-accent' };
  return null;
}
