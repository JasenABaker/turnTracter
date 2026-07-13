package com.dnd.tracker.controller;

import com.dnd.tracker.dto.EncounterStateDto;
import com.dnd.tracker.dto.TimerPauseRequest;
import com.dnd.tracker.dto.TimerSettingsRequest;
import com.dnd.tracker.service.InitiativeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/encounter")
public class EncounterController {

    private final InitiativeService initiativeService;

    public EncounterController(InitiativeService initiativeService) {
        this.initiativeService = initiativeService;
    }

    @GetMapping("/state")
    public ResponseEntity<EncounterStateDto> getState() {
        return ResponseEntity.ok(initiativeService.getEncounterState());
    }

    @PutMapping("/turn/next")
    public ResponseEntity<EncounterStateDto> nextTurn() {
        return ResponseEntity.ok(initiativeService.advanceTurn());
    }

    @PutMapping("/turn/previous")
    public ResponseEntity<EncounterStateDto> previousTurn() {
        return ResponseEntity.ok(initiativeService.previousTurn());
    }

    @PatchMapping("/timer")
    public ResponseEntity<EncounterStateDto> toggleTimer(@RequestBody TimerPauseRequest request) {
        return ResponseEntity.ok(initiativeService.toggleTimer(request.isTimerPaused()));
    }

    @PatchMapping("/timer-settings")
    public ResponseEntity<EncounterStateDto> updateTimerSettings(@RequestBody TimerSettingsRequest request) {
        return ResponseEntity.ok(initiativeService.updateTimerSettings(request.turnDurationSeconds()));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<EncounterStateDto> clearEncounter() {
        return ResponseEntity.ok(initiativeService.clearEncounter());
    }
}
