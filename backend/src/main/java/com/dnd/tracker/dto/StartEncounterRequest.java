package com.dnd.tracker.dto;

import java.util.List;
import java.util.UUID;

public record StartEncounterRequest(List<InitiativeEntry> initiatives) {

    public record InitiativeEntry(UUID combatantId, Integer initiativeScore) {}
}
