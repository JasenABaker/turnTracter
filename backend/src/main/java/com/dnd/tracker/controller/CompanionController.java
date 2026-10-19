package com.dnd.tracker.controller;

import com.dnd.tracker.dto.*;
import com.dnd.tracker.service.CompanionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/companions")
public class CompanionController {

    private final CompanionService companionService;

    public CompanionController(CompanionService companionService) {
        this.companionService = companionService;
    }

    @GetMapping
    public ResponseEntity<List<CompanionDto>> getAll() {
        return ResponseEntity.ok(companionService.getAll());
    }

    @PostMapping
    public ResponseEntity<CompanionDto> create(@RequestBody CreateCompanionRequest request) {
        return ResponseEntity.ok(companionService.toCompanionDto(companionService.create(request)));
    }

    @PostMapping("/bestiary/{name}")
    public ResponseEntity<CompanionDto> importFromBestiary(@PathVariable String name) {
        return ResponseEntity.ok(companionService.toCompanionDto(companionService.importFromBestiary(name)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CompanionDto> update(@PathVariable UUID id, @RequestBody UpdateCompanionRequest request) {
        return ResponseEntity.ok(companionService.toCompanionDto(companionService.update(id, request)));
    }

    @PatchMapping("/{id}/hp")
    public ResponseEntity<CompanionDto> updateHp(@PathVariable UUID id, @RequestBody CompanionHpUpdateRequest request) {
        return ResponseEntity.ok(companionService.toCompanionDto(companionService.updateHp(id, request)));
    }

    @PatchMapping("/{id}/temp-ac")
    public ResponseEntity<CompanionDto> updateTempAc(@PathVariable UUID id, @RequestBody Map<String, Integer> request) {
        return ResponseEntity.ok(companionService.toCompanionDto(companionService.updateTempAc(id, request.get("tempAc"))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        companionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/entries")
    public ResponseEntity<CompanionDto> addEntry(@PathVariable UUID id, @RequestBody CompanionEntryRequest request) {
        return ResponseEntity.ok(companionService.toCompanionDto(companionService.addEntry(id, request)));
    }

    @PatchMapping("/{id}/entries/{entryId}")
    public ResponseEntity<CompanionDto> updateEntry(@PathVariable UUID id, @PathVariable UUID entryId,
                                                    @RequestBody CompanionEntryRequest request) {
        return ResponseEntity.ok(companionService.toCompanionDto(companionService.updateEntry(id, entryId, request)));
    }

    @DeleteMapping("/{id}/entries/{entryId}")
    public ResponseEntity<CompanionDto> deleteEntry(@PathVariable UUID id, @PathVariable UUID entryId) {
        return ResponseEntity.ok(companionService.toCompanionDto(companionService.deleteEntry(id, entryId)));
    }

    @PatchMapping("/{id}/entries/{entryId}/charges")
    public ResponseEntity<CompanionDto> updateEntryCharges(@PathVariable UUID id, @PathVariable UUID entryId,
                                                            @RequestBody Map<String, Integer> request) {
        return ResponseEntity.ok(companionService.toCompanionDto(
                companionService.updateEntryCharges(id, entryId, request.get("usedCharges"))));
    }

    @PatchMapping("/{id}/reset-charges")
    public ResponseEntity<CompanionDto> resetCharges(@PathVariable UUID id,
                                                      @RequestParam(required = false) String scope) {
        return ResponseEntity.ok(companionService.toCompanionDto(companionService.resetCharges(id, scope)));
    }
}
