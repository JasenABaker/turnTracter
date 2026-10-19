export function groupStatCardCombatants(combatants) {
  const map = new Map();
  for (const c of combatants) {
    const key = c.sourceTemplateId ? `t:${c.sourceTemplateId}` : `n:${c.name}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(c);
  }
  return Array.from(map.values())
    .map(members => members.slice().sort((a, b) => a.turnOrder - b.turnOrder))
    .sort((a, b) => a[0].turnOrder - b[0].turnOrder);
}
