package com.dnd.tracker.dto;

public record CompanionEntryRequest(
        String category,
        String name,
        String description,
        String range,
        String hitOrDc,
        String damage,
        Integer maxCharges,
        String rechargeType
) {}
