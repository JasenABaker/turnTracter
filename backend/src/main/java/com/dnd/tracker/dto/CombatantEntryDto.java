package com.dnd.tracker.dto;

import java.util.UUID;

public record CombatantEntryDto(
        UUID id,
        String category,
        String name,
        String description,
        String range,
        String hitOrDc,
        String damage
) {}
