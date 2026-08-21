package com.dnd.tracker.dto;

public record DndBeyondCharacterDto(
        String name,
        String imageUrl,
        int hp,
        int armorClass,
        String classLevel,
        int strength,
        int dexterity,
        int constitution,
        int intelligence,
        int wisdom,
        int charisma
) {}
