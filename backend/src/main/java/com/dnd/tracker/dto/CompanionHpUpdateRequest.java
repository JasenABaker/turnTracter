package com.dnd.tracker.dto;

public record CompanionHpUpdateRequest(
        Integer currentHp,
        Integer tempHp
) {}
