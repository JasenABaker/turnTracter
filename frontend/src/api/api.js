const API_BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function getEncounterState() {
  return request('/encounter/state');
}

export function nextTurn() {
  return request('/encounter/turn/next', { method: 'PUT' });
}

export function previousTurn() {
  return request('/encounter/turn/previous', { method: 'PUT' });
}

export function updateTimerSettings(turnDurationSeconds) {
  return request('/encounter/timer-settings', {
    method: 'PATCH',
    body: JSON.stringify({ turnDurationSeconds }),
  });
}

export function toggleTimer(isTimerPaused) {
  return request('/encounter/timer', {
    method: 'PATCH',
    body: JSON.stringify({ isTimerPaused }),
  });
}

export function addPlayer(data) {
  return request('/combatants/player', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function addMonster(name, initiativeScore) {
  return request(`/combatants/monster/${encodeURIComponent(name)}`, {
    method: 'POST',
    body: JSON.stringify({ initiativeScore }),
  });
}

export function updateHp(id, data) {
  return request(`/combatants/${id}/hp`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function updateMissedAttack(id, highestMissedAttack) {
  return request(`/combatants/${id}/missed-attack`, {
    method: 'PATCH',
    body: JSON.stringify({ highestMissedAttack }),
  });
}

export function updateBonusAc(id, bonusAc) {
  return request(`/combatants/${id}/bonus-ac`, {
    method: 'PATCH',
    body: JSON.stringify({ bonusAc }),
  });
}

export function updateDamageTaken(id, damageTaken) {
  return request(`/combatants/${id}/damage-taken`, {
    method: 'PATCH',
    body: JSON.stringify({ damageTaken }),
  });
}

export function updateLastHit(id, lastHitNumber) {
  return request(`/combatants/${id}/last-hit`, {
    method: 'PATCH',
    body: JSON.stringify({ lastHitNumber }),
  });
}

export function updateCondition(id, data) {
  return request(`/combatants/${id}/condition`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function updateInitiative(id, initiativeScore) {
  return request(`/combatants/${id}/initiative`, {
    method: 'PATCH',
    body: JSON.stringify({ initiativeScore }),
  });
}

export function removeCombatant(id) {
  return request(`/combatants/${id}`, { method: 'DELETE' });
}

export function updateDeathSaves(id, data) {
  return request(`/combatants/${id}/death-saves`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function clearEncounter() {
  return request('/encounter/clear', { method: 'DELETE' });
}

export function getSavedCombatants() {
  return request('/saved-combatants');
}

export function deleteSavedCombatant(id) {
  return request(`/saved-combatants/${id}`, { method: 'DELETE' });
}
