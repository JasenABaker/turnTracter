package com.dnd.tracker.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record EncounterStateDto(
        UUID id,
        Integer currentRound,
        UUID activeTurnId,
        Instant timerStartTime,
        Boolean isTimerPaused,
        Long pausedElapsedSeconds,
        Integer turnDurationSeconds,
        List<CombatantDto> combatants
) {}
