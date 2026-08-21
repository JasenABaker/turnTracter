package com.dnd.tracker.dto;

import java.util.List;

public record UpdateCombatantStatBlockRequest(
        String name,
        String imageUrl,
        String size,
        String creatureType,
        String alignment,
        String challengeRating,
        String speed,
        Integer strength,
        Integer dexterity,
        Integer constitution,
        Integer intelligence,
        Integer wisdom,
        Integer charisma,
        List<String> damageImmunities,
        List<String> damageResistances,
        List<String> damageVulnerabilities,
        List<String> conditionImmunities,
        String senses,
        String languages
) {}
