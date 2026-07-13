package com.dnd.tracker.dto;

public record CreatePlayerRequest(
        String name,
        String imageUrl,
        Integer initiativeScore,
        Integer hp,
        Integer armorClass,
        Boolean isNpc,
        Boolean isMonster,
        Boolean unknownHp,
        Boolean unknownAc
) {}
