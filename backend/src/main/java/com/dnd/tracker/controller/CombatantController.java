package com.dnd.tracker.controller;

import com.dnd.tracker.dto.*;
import com.dnd.tracker.model.Combatant;
import com.dnd.tracker.repository.CombatantRepository;
import com.dnd.tracker.service.BestiaryService;
import com.dnd.tracker.service.CombatantService;
import com.dnd.tracker.service.DndBeyondService;
import com.dnd.tracker.service.InitiativeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/combatants")
public class CombatantController {

    private final InitiativeService initiativeService;
    private final BestiaryService bestiaryService;
    private final DndBeyondService dndBeyondService;
    private final CombatantRepository combatantRepository;
    private final CombatantService combatantService;

    public CombatantController(InitiativeService initiativeService,
                               BestiaryService bestiaryService,
                               DndBeyondService dndBeyondService,
                               CombatantRepository combatantRepository,
                               CombatantService combatantService) {
        this.initiativeService = initiativeService;
        this.bestiaryService = bestiaryService;
        this.dndBeyondService = dndBeyondService;
        this.combatantRepository = combatantRepository;
        this.combatantService = combatantService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<CombatantDto> getById(@PathVariable UUID id) {
        Combatant combatant = combatantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Combatant not found: " + id));
        return ResponseEntity.ok(initiativeService.toCombatantDto(combatant));
    }

    @PostMapping("/player")
    public ResponseEntity<CombatantDto> addPlayer(@RequestBody CreatePlayerRequest request) {
        Combatant combatant = new Combatant();
        combatant.setName(request.name());
        combatant.setImageUrl(request.imageUrl());
        combatant.setInitiativeScore(request.initiativeScore());
        boolean isUnknownHp = request.unknownHp() != null && request.unknownHp();
        combatant.setUnknownHp(isUnknownHp);
        combatant.setHp(isUnknownHp ? 0 : request.hp());
        combatant.setCurrentHp(isUnknownHp ? 0 : request.hp());
        boolean isUnknownAc = request.unknownAc() != null && request.unknownAc();
        combatant.setUnknownAc(isUnknownAc);
        combatant.setArmorClass(isUnknownAc ? 0 : request.armorClass());
        combatant.setIsNpc(request.isNpc() != null && request.isNpc());
        combatant.setIsMonster(request.isMonster() != null && request.isMonster());

        Combatant saved = request.encounterId() == null
                ? combatantService.createTemplate(combatant)
                : initiativeService.addCombatant(combatant, request.encounterId());
        return ResponseEntity.ok(initiativeService.toCombatantDto(saved));
    }

    @PostMapping("/monster/{name}")
    public ResponseEntity<CombatantDto> addMonster(@PathVariable String name,
                                                   @RequestBody(required = false) CreateMonsterRequest request) {
        Integer initiative = (request != null) ? request.initiativeScore() : null;
        UUID encounterId = (request != null) ? request.encounterId() : null;
        Combatant monster = bestiaryService.fetchMonster(name, initiative);
        Combatant saved = encounterId == null
                ? combatantService.createTemplate(monster)
                : initiativeService.addCombatant(monster, encounterId);
        return ResponseEntity.ok(initiativeService.toCombatantDto(saved));
    }

    @PostMapping("/bestiary/import-all")
    public ResponseEntity<BulkImportResultDto> importAllFromBestiary() {
        return ResponseEntity.ok(bestiaryService.importAllMonsters());
    }

    @GetMapping("/templates")
    public ResponseEntity<List<CombatantDto>> getTemplates(@RequestParam(required = false) String q) {
        List<Combatant> templates = combatantRepository.findByEncounterIsNullOrderByNameAsc();
        List<CombatantDto> dtos = templates.stream()
                .filter(c -> q == null || q.isBlank() || c.getName().toLowerCase().contains(q.toLowerCase()))
                .map(initiativeService::toCombatantDto)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/dndbeyond/preview")
    public ResponseEntity<DndBeyondCharacterDto> previewDndBeyondCharacter(@RequestBody DndBeyondImportRequest request) {
        return ResponseEntity.ok(dndBeyondService.fetchCharacterPreview(request.characterUrl()));
    }

    @PatchMapping("/{id}/hp")
    public ResponseEntity<CombatantDto> updateHp(@PathVariable UUID id, @RequestBody HpUpdateRequest request) {
        Combatant combatant = combatantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Combatant not found: " + id));

        if (request.currentHp() != null) {
            combatant.setCurrentHp(request.currentHp());
        }
        if (request.tempHp() != null) {
            combatant.setTempHp(request.tempHp());
        }

        combatantRepository.save(combatant);
        return ResponseEntity.ok(initiativeService.toCombatantDto(combatant));
    }

    @PatchMapping("/{id}/bonus-ac")
    public ResponseEntity<CombatantDto> updateBonusAc(@PathVariable UUID id, @RequestBody Map<String, Integer> request) {
        Combatant combatant = combatantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Combatant not found: " + id));

        Integer bonusAc = request.get("bonusAc");
        if (bonusAc != null) {
            combatant.setBonusAc(Math.max(0, bonusAc));
        }

        combatantRepository.save(combatant);
        return ResponseEntity.ok(initiativeService.toCombatantDto(combatant));
    }

    @PatchMapping("/{id}/missed-attack")
    public ResponseEntity<CombatantDto> updateMissedAttack(@PathVariable UUID id,
                                                           @RequestBody MissedAttackRequest request) {
        Combatant combatant = combatantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Combatant not found: " + id));

        if (request.highestMissedAttack() != null) {
            combatant.setHighestMissedAttack(request.highestMissedAttack());
        }

        combatantRepository.save(combatant);
        return ResponseEntity.ok(initiativeService.toCombatantDto(combatant));
    }

    @PatchMapping("/{id}/initiative")
    public ResponseEntity<CombatantDto> updateInitiative(@PathVariable UUID id,
                                                         @RequestBody InitiativeUpdateRequest request) {
        Combatant combatant = combatantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Combatant not found: " + id));

        if (request.initiativeScore() != null) {
            combatant.setInitiativeScore(request.initiativeScore());
        }

        combatantRepository.save(combatant);
        initiativeService.reSortCombatants(combatant.getEncounter().getId());

        Combatant updated = combatantRepository.findById(id).orElse(combatant);
        return ResponseEntity.ok(initiativeService.toCombatantDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeCombatant(@PathVariable UUID id) {
        initiativeService.removeCombatant(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/damage-taken")
    public ResponseEntity<CombatantDto> updateDamageTaken(@PathVariable UUID id, @RequestBody Map<String, Integer> request) {
        Combatant combatant = combatantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Combatant not found: " + id));

        Integer damageTaken = request.get("damageTaken");
        if (damageTaken != null) {
            combatant.setDamageTaken(Math.max(0, damageTaken));
        }

        combatantRepository.save(combatant);
        return ResponseEntity.ok(initiativeService.toCombatantDto(combatant));
    }

    @PatchMapping("/{id}/last-hit")
    public ResponseEntity<CombatantDto> updateLastHit(@PathVariable UUID id, @RequestBody Map<String, Integer> request) {
        Combatant combatant = combatantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Combatant not found: " + id));

        Integer lastHitNumber = request.get("lastHitNumber");
        if (lastHitNumber != null) {
            combatant.setLastHitNumber(Math.max(0, lastHitNumber));
        }

        combatantRepository.save(combatant);
        return ResponseEntity.ok(initiativeService.toCombatantDto(combatant));
    }

    @PatchMapping("/{id}/condition")
    public ResponseEntity<CombatantDto> updateCondition(@PathVariable UUID id, @RequestBody Map<String, Boolean> request) {
        Combatant combatant = combatantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Combatant not found: " + id));

        if (request.containsKey("manualBloodied")) {
            combatant.setManualBloodied(request.get("manualBloodied"));
        }
        if (request.containsKey("manualDead")) {
            combatant.setManualDead(request.get("manualDead"));
        }

        combatantRepository.save(combatant);
        return ResponseEntity.ok(initiativeService.toCombatantDto(combatant));
    }

    @PatchMapping("/{id}/active-conditions")
    public ResponseEntity<CombatantDto> updateActiveConditions(@PathVariable UUID id,
                                                                 @RequestBody UpdateActiveConditionsRequest request) {
        Combatant combatant = combatantService.updateActiveConditions(id, request.activeConditions());
        return ResponseEntity.ok(initiativeService.toCombatantDto(combatant));
    }

    @PatchMapping("/{id}/death-saves")
    public ResponseEntity<CombatantDto> updateDeathSaves(@PathVariable UUID id,
                                                        @RequestBody DeathSaveRequest request) {
        Combatant combatant = combatantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Combatant not found: " + id));

        if (request.deathSaveSuccesses() != null) {
            combatant.setDeathSaveSuccesses(Math.min(3, Math.max(0, request.deathSaveSuccesses())));
        }
        if (request.deathSaveFailures() != null) {
            combatant.setDeathSaveFailures(Math.min(3, Math.max(0, request.deathSaveFailures())));
        }

        combatantRepository.save(combatant);
        return ResponseEntity.ok(initiativeService.toCombatantDto(combatant));
    }

    @PatchMapping("/{id}/statblock")
    public ResponseEntity<CombatantDto> updateStatBlock(@PathVariable UUID id,
                                                         @RequestBody UpdateCombatantStatBlockRequest request) {
        return ResponseEntity.ok(initiativeService.toCombatantDto(combatantService.updateStatBlock(id, request)));
    }

    @PostMapping("/{id}/entries")
    public ResponseEntity<CombatantDto> addEntry(@PathVariable UUID id, @RequestBody CombatantEntryRequest request) {
        return ResponseEntity.ok(initiativeService.toCombatantDto(combatantService.addEntry(id, request)));
    }

    @PatchMapping("/{id}/entries/{entryId}")
    public ResponseEntity<CombatantDto> updateEntry(@PathVariable UUID id, @PathVariable UUID entryId,
                                                     @RequestBody CombatantEntryRequest request) {
        return ResponseEntity.ok(initiativeService.toCombatantDto(combatantService.updateEntry(id, entryId, request)));
    }

    @DeleteMapping("/{id}/entries/{entryId}")
    public ResponseEntity<CombatantDto> deleteEntry(@PathVariable UUID id, @PathVariable UUID entryId) {
        return ResponseEntity.ok(initiativeService.toCombatantDto(combatantService.deleteEntry(id, entryId)));
    }
}
