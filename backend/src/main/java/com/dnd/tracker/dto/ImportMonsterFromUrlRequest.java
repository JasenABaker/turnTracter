package com.dnd.tracker.dto;

import java.util.UUID;

public record ImportMonsterFromUrlRequest(
        String monsterUrl,
        Integer initiativeScore,
        UUID encounterId
) {}
