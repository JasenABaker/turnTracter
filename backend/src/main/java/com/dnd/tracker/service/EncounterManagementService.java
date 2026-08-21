package com.dnd.tracker.service;

import com.dnd.tracker.dto.EncounterDetailDto;
import com.dnd.tracker.dto.EncounterSummaryDto;
import com.dnd.tracker.dto.StartEncounterRequest;
import com.dnd.tracker.model.Combatant;
import com.dnd.tracker.model.Encounter;
import com.dnd.tracker.model.Player;
import com.dnd.tracker.repository.CombatantRepository;
import com.dnd.tracker.repository.EncounterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class EncounterManagementService {

    private static final int MAX_AVATARS = 4;

    private final EncounterRepository encounterRepository;
    private final CombatantRepository combatantRepository;
    private final CombatantService combatantService;
    private final PlayerService playerService;
    private final InitiativeService initiativeService;

    public EncounterManagementService(EncounterRepository encounterRepository,
                                       CombatantRepository combatantRepository,
                                       CombatantService combatantService,
                                       PlayerService playerService,
                                       InitiativeService initiativeService) {
        this.encounterRepository = encounterRepository;
        this.combatantRepository = combatantRepository;
        this.combatantService = combatantService;
        this.playerService = playerService;
        this.initiativeService = initiativeService;
    }

    @Transactional(readOnly = true)
    public List<EncounterSummaryDto> listSummaries() {
        return encounterRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toSummaryDto)
                .toList();
    }

    public Encounter create(String name) {
        Encounter encounter = new Encounter();
        encounter.setName(name);
        encounter.setStatus("draft");
        return encounterRepository.save(encounter);
    }

    public Encounter findOrThrow(UUID id) {
        return encounterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Encounter not found: " + id));
    }

    @Transactional(readOnly = true)
    public EncounterDetailDto getDetail(UUID id) {
        Encounter encounter = findOrThrow(id);
        List<Combatant> combatants = combatantRepository.findByEncounterIdOrderByTurnOrderAsc(id);
        return new EncounterDetailDto(
                encounter.getId(),
                encounter.getName(),
                encounter.getStatus(),
                combatants.stream().map(initiativeService::toCombatantDto).toList()
        );
    }

    @Transactional(readOnly = true)
    public EncounterSummaryDto getSummary(UUID id) {
        return toSummaryDto(findOrThrow(id));
    }

    public Encounter rename(UUID id, String name) {
        Encounter encounter = findOrThrow(id);
        encounter.setName(name);
        return encounterRepository.save(encounter);
    }

    @Transactional(readOnly = true)
    public EncounterSummaryDto getActiveOrNull() {
        return encounterRepository.findFirstByStatus("active")
                .map(this::toSummaryDto)
                .orElse(null);
    }

    public Combatant addPlayer(UUID encounterId, UUID playerId, Integer initiativeScore) {
        Encounter encounter = findOrThrow(encounterId);
        Player player = playerService.findOrThrow(playerId);
        Combatant combatant = combatantService.createFromPlayer(player, encounter, initiativeScore);
        initiativeService.reSortCombatants(encounterId);
        return combatant;
    }

    public Combatant addTemplate(UUID encounterId, UUID templateId, Integer initiativeScore, String name) {
        Encounter encounter = findOrThrow(encounterId);
        Combatant combatant = combatantService.cloneIntoEncounter(templateId, encounter, initiativeScore, name);
        initiativeService.reSortCombatants(encounterId);
        return combatant;
    }

    public void removeFromRoster(UUID combatantId) {
        initiativeService.removeCombatant(combatantId);
    }

    public Encounter reset(UUID id) {
        Encounter encounter = findOrThrow(id);

        List<Combatant> combatants = combatantRepository.findByEncounterIdOrderByTurnOrderAsc(id);
        for (Combatant combatant : combatants) {
            combatant.setCurrentHp(combatant.getHp());
            combatant.setTempHp(0);
            combatant.setBonusAc(0);
            combatant.setHighestMissedAttack(0);
            combatant.setDamageTaken(0);
            combatant.setLastHitNumber(0);
            combatant.setManualBloodied(false);
            combatant.setManualDead(false);
            combatant.setDeathSaveSuccesses(0);
            combatant.setDeathSaveFailures(0);
            combatant.setInitiativeScore(0);
        }
        combatantRepository.saveAll(combatants);

        encounter.setCurrentRound(1);
        encounter.setActiveTurnId(null);
        encounter.setTimerStartTime(null);
        encounter.setIsTimerPaused(false);
        encounter.setPausedElapsedSeconds(0L);
        encounter.setStatus("draft");
        encounter.setStartedAt(null);
        return encounterRepository.save(encounter);
    }

    public void delete(UUID id) {
        Encounter encounter = findOrThrow(id);
        combatantRepository.deleteAll(combatantRepository.findByEncounterIdOrderByTurnOrderAsc(id));
        encounterRepository.delete(encounter);
    }

    public void start(UUID id, List<StartEncounterRequest.InitiativeEntry> initiatives) {
        Encounter encounter = findOrThrow(id);

        if (initiatives != null) {
            for (StartEncounterRequest.InitiativeEntry entry : initiatives) {
                Combatant combatant = combatantRepository.findById(entry.combatantId())
                        .orElseThrow(() -> new IllegalArgumentException("Combatant not found: " + entry.combatantId()));
                combatant.setInitiativeScore(entry.initiativeScore() != null ? entry.initiativeScore() : 0);
                combatantRepository.save(combatant);
            }
        }

        for (Encounter other : encounterRepository.findAllByStatus("active")) {
            other.setStatus("completed");
            encounterRepository.save(other);
        }

        encounter.setStatus("active");
        encounter.setStartedAt(Instant.now());
        encounterRepository.save(encounter);
        initiativeService.reSortCombatants(id);
    }

    private EncounterSummaryDto toSummaryDto(Encounter encounter) {
        List<Combatant> combatants = combatantRepository.findByEncounterIdOrderByTurnOrderAsc(encounter.getId());
        List<Combatant> players = combatants.stream()
                .filter(c -> !Boolean.TRUE.equals(c.getIsMonster()) && !Boolean.TRUE.equals(c.getIsNpc()))
                .toList();
        List<EncounterSummaryDto.PlayerAvatarDto> avatars = players.stream()
                .limit(MAX_AVATARS)
                .map(c -> new EncounterSummaryDto.PlayerAvatarDto(c.getName(), c.getImageUrl()))
                .toList();
        int overflow = Math.max(0, players.size() - MAX_AVATARS);
        return new EncounterSummaryDto(
                encounter.getId(),
                encounter.getName(),
                encounter.getStatus(),
                combatants.size(),
                avatars,
                overflow
        );
    }
}
