package com.dnd.tracker.dto;

public record CreatePlayerTemplateRequest(
        String name,
        String classLevel,
        String imageUrl,
        Integer maxHp,
        Integer armorClass,
        Integer passivePerception,
        Integer strength,
        Integer dexterity,
        Integer constitution,
        Integer intelligence,
        Integer wisdom,
        Integer charisma
) {}
