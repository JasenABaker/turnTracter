package com.dnd.tracker.dto;

import java.util.UUID;

public record CreateMonsterRequest(
        Integer initiativeScore,
        UUID encounterId
) {}
