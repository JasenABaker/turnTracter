package com.dnd.tracker.dto;

public record AddToEncounterRequest(Integer initiativeScore, String name, Boolean unknownHp, Boolean unknownAc) {}
