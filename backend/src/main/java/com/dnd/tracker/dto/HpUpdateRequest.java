package com.dnd.tracker.dto;

public record HpUpdateRequest(
        Integer currentHp,
        Integer tempHp
) {}
