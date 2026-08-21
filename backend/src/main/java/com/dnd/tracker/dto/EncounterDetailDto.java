package com.dnd.tracker.dto;

import java.util.List;
import java.util.UUID;

public record EncounterDetailDto(
        UUID id,
        String name,
        String status,
        List<CombatantDto> combatants
) {}
