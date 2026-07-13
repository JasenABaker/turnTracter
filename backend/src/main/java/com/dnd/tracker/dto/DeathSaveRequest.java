package com.dnd.tracker.dto;

public record DeathSaveRequest(
        Integer deathSaveSuccesses,
        Integer deathSaveFailures
) {}
