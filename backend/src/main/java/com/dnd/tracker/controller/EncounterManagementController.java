package com.dnd.tracker.controller;

import com.dnd.tracker.dto.*;
import com.dnd.tracker.model.Encounter;
import com.dnd.tracker.service.EncounterManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/encounters")
public class EncounterManagementController {

    private final EncounterManagementService encounterManagementService;

    public EncounterManagementController(EncounterManagementService encounterManagementService) {
        this.encounterManagementService = encounterManagementService;
    }

    @GetMapping
    public ResponseEntity<List<EncounterSummaryDto>> list() {
        return ResponseEntity.ok(encounterManagementService.listSummaries());
    }

    @PostMapping
    public ResponseEntity<EncounterSummaryDto> create(@RequestBody CreateEncounterRequest request) {
        Encounter encounter = encounterManagementService.create(request.name());
        return ResponseEntity.ok(encounterManagementService.getSummary(encounter.getId()));
    }

    @GetMapping("/active")
    public ResponseEntity<EncounterSummaryDto> getActive() {
        EncounterSummaryDto active = encounterManagementService.getActiveOrNull();
        return active != null ? ResponseEntity.ok(active) : ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EncounterDetailDto> getDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(encounterManagementService.getDetail(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<EncounterDetailDto> rename(@PathVariable UUID id, @RequestBody RenameEncounterRequest request) {
        encounterManagementService.rename(id, request.name());
        return ResponseEntity.ok(encounterManagementService.getDetail(id));
    }

    @PostMapping("/{id}/players/{playerId}")
    public ResponseEntity<EncounterDetailDto> addPlayer(@PathVariable UUID id, @PathVariable UUID playerId,
                                                         @RequestBody(required = false) AddToEncounterRequest request) {
        Integer initiativeScore = request != null ? request.initiativeScore() : null;
        encounterManagementService.addPlayer(id, playerId, initiativeScore);
        return ResponseEntity.ok(encounterManagementService.getDetail(id));
    }

    @PostMapping("/{id}/combatant-templates/{templateId}")
    public ResponseEntity<EncounterDetailDto> addTemplate(@PathVariable UUID id, @PathVariable UUID templateId,
                                                           @RequestBody(required = false) AddToEncounterRequest request) {
        Integer initiativeScore = request != null ? request.initiativeScore() : null;
        String name = request != null ? request.name() : null;
        encounterManagementService.addTemplate(id, templateId, initiativeScore, name);
        return ResponseEntity.ok(encounterManagementService.getDetail(id));
    }

    @DeleteMapping("/{id}/combatants/{combatantId}")
    public ResponseEntity<EncounterDetailDto> removeFromRoster(@PathVariable UUID id, @PathVariable UUID combatantId) {
        encounterManagementService.removeFromRoster(combatantId);
        return ResponseEntity.ok(encounterManagementService.getDetail(id));
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<EncounterDetailDto> start(@PathVariable UUID id, @RequestBody StartEncounterRequest request) {
        encounterManagementService.start(id, request.initiatives());
        return ResponseEntity.ok(encounterManagementService.getDetail(id));
    }

    @PatchMapping("/{id}/reset")
    public ResponseEntity<EncounterDetailDto> reset(@PathVariable UUID id) {
        encounterManagementService.reset(id);
        return ResponseEntity.ok(encounterManagementService.getDetail(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        encounterManagementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
