const API_BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(text || res.statusText);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/uploads`, { method: 'POST', body: formData });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
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

export function addMonster(name, initiativeScore, encounterId) {
  return request(`/combatants/monster/${encodeURIComponent(name)}`, {
    method: 'POST',
    body: JSON.stringify({ initiativeScore, encounterId }),
  });
}

export function importMonsterFromDndBeyond(monsterUrl, initiativeScore, encounterId) {
  return request('/combatants/dndbeyond/monster', {
    method: 'POST',
    body: JSON.stringify({ monsterUrl, initiativeScore, encounterId }),
  });
}

export function importAllFromBestiary() {
  return request('/combatants/bestiary/import-all', { method: 'POST' });
}

export function getCombatantTemplates(q) {
  const query = q ? `?q=${encodeURIComponent(q)}` : '';
  return request(`/combatants/templates${query}`);
}

export function previewDndBeyondCharacter(characterUrl) {
  return request('/combatants/dndbeyond/preview', {
    method: 'POST',
    body: JSON.stringify({ characterUrl }),
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

export function updateActiveConditions(id, conditions) {
  return request(`/combatants/${id}/active-conditions`, {
    method: 'PATCH',
    body: JSON.stringify({ activeConditions: conditions }),
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

export function getCombatant(id) {
  return request(`/combatants/${id}`);
}

export function updateCombatantStatBlock(id, data) {
  return request(`/combatants/${id}/statblock`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function addCombatantEntry(id, entry) {
  return request(`/combatants/${id}/entries`, {
    method: 'POST',
    body: JSON.stringify(entry),
  });
}

export function updateCombatantEntry(id, entryId, entry) {
  return request(`/combatants/${id}/entries/${entryId}`, {
    method: 'PATCH',
    body: JSON.stringify(entry),
  });
}

export function deleteCombatantEntry(id, entryId) {
  return request(`/combatants/${id}/entries/${entryId}`, { method: 'DELETE' });
}

export function getPlayers(q) {
  const query = q ? `?q=${encodeURIComponent(q)}` : '';
  return request(`/players${query}`);
}

export function createPlayer(data) {
  return request('/players', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getPlayer(id) {
  return request(`/players/${id}`);
}

export function updatePlayer(id, data) {
  return request(`/players/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deletePlayer(id) {
  return request(`/players/${id}`, { method: 'DELETE' });
}

export function getEncounters() {
  return request('/encounters');
}

export function createEncounter(name) {
  return request('/encounters', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function getEncounter(id) {
  return request(`/encounters/${id}`);
}

export function renameEncounter(id, name) {
  return request(`/encounters/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export function getActiveEncounter() {
  return request('/encounters/active');
}

export function addPlayerToEncounter(encounterId, playerId, initiativeScore) {
  return request(`/encounters/${encounterId}/players/${playerId}`, {
    method: 'POST',
    body: JSON.stringify({ initiativeScore: initiativeScore ?? null }),
  });
}

export function addTemplateToEncounter(encounterId, templateId, initiativeScore, name, unknownHp, unknownAc) {
  return request(`/encounters/${encounterId}/combatant-templates/${templateId}`, {
    method: 'POST',
    body: JSON.stringify({
      initiativeScore: initiativeScore ?? null,
      name: name ?? null,
      unknownHp: unknownHp ?? null,
      unknownAc: unknownAc ?? null,
    }),
  });
}

export function removeFromEncounterRoster(encounterId, combatantId) {
  return request(`/encounters/${encounterId}/combatants/${combatantId}`, { method: 'DELETE' });
}

export function startEncounter(encounterId, initiatives) {
  return request(`/encounters/${encounterId}/start`, {
    method: 'PATCH',
    body: JSON.stringify({ initiatives }),
  });
}

export function resetEncounter(encounterId) {
  return request(`/encounters/${encounterId}/reset`, { method: 'PATCH' });
}

export function deleteEncounter(encounterId) {
  return request(`/encounters/${encounterId}`, { method: 'DELETE' });
}

export function getCompanions() {
  return request('/companions');
}

export function createCompanion(data) {
  return request('/companions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function importCompanionFromBestiary(name) {
  return request(`/companions/bestiary/${encodeURIComponent(name)}`, { method: 'POST' });
}

export function updateCompanion(id, data) {
  return request(`/companions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function updateCompanionHp(id, data) {
  return request(`/companions/${id}/hp`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function updateCompanionTempAc(id, tempAc) {
  return request(`/companions/${id}/temp-ac`, {
    method: 'PATCH',
    body: JSON.stringify({ tempAc }),
  });
}

export function deleteCompanion(id) {
  return request(`/companions/${id}`, { method: 'DELETE' });
}

export function addCompanionEntry(id, entry) {
  return request(`/companions/${id}/entries`, {
    method: 'POST',
    body: JSON.stringify(entry),
  });
}

export function updateCompanionEntry(id, entryId, entry) {
  return request(`/companions/${id}/entries/${entryId}`, {
    method: 'PATCH',
    body: JSON.stringify(entry),
  });
}

export function deleteCompanionEntry(id, entryId) {
  return request(`/companions/${id}/entries/${entryId}`, { method: 'DELETE' });
}
