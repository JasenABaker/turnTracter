package com.dnd.tracker.dto;

import java.util.List;

public record UpdateCompanionRequest(
        String name,
        String imageUrl,
        Integer maxHp,
        Integer armorClass,
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
