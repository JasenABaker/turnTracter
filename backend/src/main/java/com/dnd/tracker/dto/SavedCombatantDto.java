package com.dnd.tracker.dto;

import java.util.UUID;

public record SavedCombatantDto(
        UUID id,
        String name,
        String imageUrl,
        Integer hp,
        Integer armorClass,
        Boolean isMonster,
        Boolean isNpc
) {}
