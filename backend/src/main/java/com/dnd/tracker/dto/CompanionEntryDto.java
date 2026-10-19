package com.dnd.tracker.dto;

import java.util.UUID;

public record CompanionEntryDto(
        UUID id,
        String category,
        String name,
        String description,
        String range,
        String hitOrDc,
        String damage,
        Integer maxCharges,
        Integer usedCharges,
        String rechargeType
) {}
