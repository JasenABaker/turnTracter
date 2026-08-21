package com.dnd.tracker.dto;

public record CombatantEntryRequest(
        String category,
        String name,
        String description,
        String range,
        String hitOrDc,
        String damage
) {}
