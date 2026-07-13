package com.dnd.tracker.dto;

import java.util.UUID;

public record CombatantDto(
        UUID id,
        String name,
        String imageUrl,
        Integer initiativeScore,
        Integer hp,
        Integer currentHp,
        Integer tempHp,
        Integer armorClass,
        Integer bonusAc,
        Integer highestMissedAttack,
        Boolean isMonster,
        Boolean isNpc,
        Boolean unknownHp,
        Boolean unknownAc,
        Integer damageTaken,
        Integer lastHitNumber,
        Boolean manualBloodied,
        Boolean manualDead,
        Integer turnOrder,
        boolean isBloodied,
        Integer deathSaveSuccesses,
        Integer deathSaveFailures
) {}
