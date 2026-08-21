package com.dnd.tracker.dto;

import java.util.List;
import java.util.UUID;

public record CompanionDto(
        UUID id,
        String name,
        String imageUrl,
        Integer maxHp,
        Integer currentHp,
        Integer tempHp,
        Integer armorClass,
        Integer tempAc,
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
        String languages,
        List<CompanionEntryDto> entries
) {}
