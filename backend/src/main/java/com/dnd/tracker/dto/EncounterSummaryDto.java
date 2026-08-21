package com.dnd.tracker.dto;

import java.util.List;
import java.util.UUID;

public record EncounterSummaryDto(
        UUID id,
        String name,
        String status,
        int combatantCount,
        List<PlayerAvatarDto> playerAvatars,
        int overflowCount
) {
    public record PlayerAvatarDto(String name, String imageUrl) {}
}
