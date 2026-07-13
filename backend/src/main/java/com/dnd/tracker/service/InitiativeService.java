package com.dnd.tracker.service;

import com.dnd.tracker.dto.CombatantDto;
import com.dnd.tracker.dto.EncounterStateDto;
import com.dnd.tracker.model.Combatant;
import com.dnd.tracker.model.Encounter;
import com.dnd.tracker.model.SavedCombatant;
import com.dnd.tracker.repository.CombatantRepository;
import com.dnd.tracker.repository.EncounterRepository;
import com.dnd.tracker.repository.SavedCombatantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class InitiativeService {

    private final EncounterRepository encounterRepository;
    private final CombatantRepository combatantRepository;
    private final SavedCombatantRepository savedCombatantRepository;

    public InitiativeService(EncounterRepository encounterRepository, CombatantRepository combatantRepository,
                             SavedCombatantRepository savedCombatantRepository) {
        this.encounterRepository = encounterRepository;
        this.combatantRepository = combatantRepository;
        this.savedCombatantRepository = savedCombatantRepository;
    }

    public Encounter getOrCreateEncounter() {
        List<Encounter> encounters = encounterRepository.findAll();
        if (!encounters.isEmpty()) {
            return encounters.get(0);
        }
        Encounter encounter = new Encounter();
        return encounterRepository.save(encounter);
    }

    @Transactional(readOnly = true)
    public EncounterStateDto getEncounterState() {
        Encounter encounter = getOrCreateEncounter();
        List<Combatant> combatants = combatantRepository.findByEncounterIdOrderByTurnOrderAsc(encounter.getId());
        return buildStateDto(encounter, combatants);
    }

    public EncounterStateDto advanceTurn() {
        Encounter encounter = getOrCreateEncounter();
        List<Combatant> combatants = combatantRepository.findByEncounterIdOrderByTurnOrderAsc(encounter.getId());

        if (combatants.isEmpty()) {
            return buildStateDto(encounter, combatants);
        }

        UUID currentTurnId = encounter.getActiveTurnId();

        if (currentTurnId == null) {
            int startIndex = findNextAliveIndex(combatants, -1);
            encounter.setActiveTurnId(combatants.get(startIndex).getId());
        } else {
            int currentIndex = findIndexById(combatants, currentTurnId);
            int nextIndex = currentIndex + 1;
            int roundsAdvanced = 0;

            if (nextIndex >= combatants.size()) {
                nextIndex = 0;
                roundsAdvanced++;
            }

            // Skip dead combatants
            int checked = 0;
            while (isDead(combatants.get(nextIndex)) && checked < combatants.size()) {
                nextIndex++;
                if (nextIndex >= combatants.size()) {
                    nextIndex = 0;
                    roundsAdvanced++;
                }
                checked++;
            }

            if (roundsAdvanced > 0) {
                encounter.setCurrentRound(encounter.getCurrentRound() + 1);
            }

            encounter.setActiveTurnId(combatants.get(nextIndex).getId());
        }

        resetTimer(encounter);
        encounterRepository.save(encounter);
        return buildStateDto(encounter, combatants);
    }

    public EncounterStateDto previousTurn() {
        Encounter encounter = getOrCreateEncounter();
        List<Combatant> combatants = combatantRepository.findByEncounterIdOrderByTurnOrderAsc(encounter.getId());

        if (combatants.isEmpty()) {
            return buildStateDto(encounter, combatants);
        }

        UUID currentTurnId = encounter.getActiveTurnId();

        if (currentTurnId == null) {
            int startIndex = findPrevAliveIndex(combatants, combatants.size());
            encounter.setActiveTurnId(combatants.get(startIndex).getId());
        } else {
            int currentIndex = findIndexById(combatants, currentTurnId);
            int prevIndex = currentIndex - 1;
            int roundsBack = 0;

            if (prevIndex < 0) {
                prevIndex = combatants.size() - 1;
                roundsBack++;
            }

            // Skip dead combatants
            int checked = 0;
            while (isDead(combatants.get(prevIndex)) && checked < combatants.size()) {
                prevIndex--;
                if (prevIndex < 0) {
                    prevIndex = combatants.size() - 1;
                    roundsBack++;
                }
                checked++;
            }

            if (roundsBack > 0) {
                encounter.setCurrentRound(Math.max(1, encounter.getCurrentRound() - 1));
            }

            encounter.setActiveTurnId(combatants.get(prevIndex).getId());
        }

        resetTimer(encounter);
        encounterRepository.save(encounter);
        return buildStateDto(encounter, combatants);
    }

    public EncounterStateDto toggleTimer(boolean paused) {
        Encounter encounter = getOrCreateEncounter();

        if (paused && !encounter.getIsTimerPaused()) {
            // Pausing: capture elapsed seconds
            if (encounter.getTimerStartTime() != null) {
                long elapsed = Duration.between(encounter.getTimerStartTime(), Instant.now()).getSeconds();
                encounter.setPausedElapsedSeconds(elapsed);
            }
            encounter.setIsTimerPaused(true);
        } else if (!paused && encounter.getIsTimerPaused()) {
            // Unpausing: shift timerStartTime backward by accumulated elapsed
            encounter.setTimerStartTime(Instant.now().minusSeconds(encounter.getPausedElapsedSeconds()));
            encounter.setPausedElapsedSeconds(0L);
            encounter.setIsTimerPaused(false);
        }

        encounterRepository.save(encounter);
        List<Combatant> combatants = combatantRepository.findByEncounterIdOrderByTurnOrderAsc(encounter.getId());
        return buildStateDto(encounter, combatants);
    }

    public EncounterStateDto updateTimerSettings(int turnDurationSeconds) {
        Encounter encounter = getOrCreateEncounter();
        encounter.setTurnDurationSeconds(turnDurationSeconds);
        encounterRepository.save(encounter);
        List<Combatant> combatants = combatantRepository.findByEncounterIdOrderByTurnOrderAsc(encounter.getId());
        return buildStateDto(encounter, combatants);
    }

    public Combatant addCombatant(Combatant combatant) {
        Encounter encounter = getOrCreateEncounter();
        combatant.setEncounter(encounter);
        Combatant saved = combatantRepository.save(combatant);
        saveCombatantTemplate(saved);
        reSortCombatants(encounter.getId());
        return combatantRepository.findById(saved.getId()).orElse(saved);
    }

    public EncounterStateDto clearEncounter() {
        Encounter encounter = getOrCreateEncounter();
        combatantRepository.deleteAll(combatantRepository.findByEncounterIdOrderByTurnOrderAsc(encounter.getId()));
        encounter.setCurrentRound(1);
        encounter.setActiveTurnId(null);
        resetTimer(encounter);
        encounterRepository.save(encounter);
        return buildStateDto(encounter, List.of());
    }

    private void saveCombatantTemplate(Combatant c) {
        // Strip trailing numbers from name for template (e.g., "Goblin 1" -> "Goblin")
        String templateName = c.getName().replaceAll("\\s+\\d+$", "");
        if (!savedCombatantRepository.existsByNameAndHpAndArmorClassAndIsMonsterAndIsNpc(
                templateName, c.getHp(), c.getArmorClass(), c.getIsMonster(), c.getIsNpc())) {
            SavedCombatant saved = new SavedCombatant();
            saved.setName(templateName);
            saved.setImageUrl(c.getImageUrl());
            saved.setHp(c.getHp());
            saved.setArmorClass(c.getArmorClass());
            saved.setIsMonster(c.getIsMonster());
            saved.setIsNpc(c.getIsNpc());
            savedCombatantRepository.save(saved);
        }
    }

    public void reSortCombatants(UUID encounterId) {
        List<Combatant> combatants = combatantRepository.findByEncounterIdOrderByInitiativeScoreDesc(encounterId);
        for (int i = 0; i < combatants.size(); i++) {
            combatants.get(i).setTurnOrder(i + 1);
        }
        combatantRepository.saveAll(combatants);
    }

    public void removeCombatant(UUID combatantId) {
        Combatant combatant = combatantRepository.findById(combatantId)
                .orElseThrow(() -> new IllegalArgumentException("Combatant not found: " + combatantId));

        UUID encounterId = combatant.getEncounter().getId();
        Encounter encounter = combatant.getEncounter();

        // If the deleted combatant is the active turn, advance first
        if (combatantId.equals(encounter.getActiveTurnId())) {
            encounter.setActiveTurnId(null);
            encounterRepository.save(encounter);
        }

        combatantRepository.deleteById(combatantId);
        reSortCombatants(encounterId);
    }

    private void resetTimer(Encounter encounter) {
        encounter.setTimerStartTime(Instant.now());
        encounter.setIsTimerPaused(false);
        encounter.setPausedElapsedSeconds(0L);
    }

    private int findIndexById(List<Combatant> combatants, UUID id) {
        for (int i = 0; i < combatants.size(); i++) {
            if (combatants.get(i).getId().equals(id)) {
                return i;
            }
        }
        return 0;
    }

    private boolean isDead(Combatant c) {
        if (c.getManualDead() != null && c.getManualDead()) return true;
        if (c.getUnknownHp() != null && c.getUnknownHp()) return false;
        if (c.getCurrentHp() <= 0 && c.getIsMonster()) return true;
        if (c.getCurrentHp() <= 0 && c.getDeathSaveFailures() >= 3) return true;
        return false;
    }

    private int findNextAliveIndex(List<Combatant> combatants, int fromIndex) {
        for (int i = 1; i <= combatants.size(); i++) {
            int idx = (fromIndex + i) % combatants.size();
            if (idx < 0) idx += combatants.size();
            if (!isDead(combatants.get(idx))) return idx;
        }
        return 0;
    }

    private int findPrevAliveIndex(List<Combatant> combatants, int fromIndex) {
        for (int i = 1; i <= combatants.size(); i++) {
            int idx = (fromIndex - i) % combatants.size();
            if (idx < 0) idx += combatants.size();
            if (!isDead(combatants.get(idx))) return idx;
        }
        return combatants.size() - 1;
    }

    private EncounterStateDto buildStateDto(Encounter encounter, List<Combatant> combatants) {
        List<CombatantDto> dtos = combatants.stream()
                .map(this::toCombatantDto)
                .toList();

        return new EncounterStateDto(
                encounter.getId(),
                encounter.getCurrentRound(),
                encounter.getActiveTurnId(),
                encounter.getTimerStartTime(),
                encounter.getIsTimerPaused(),
                encounter.getPausedElapsedSeconds(),
                encounter.getTurnDurationSeconds(),
                dtos
        );
    }

    public CombatantDto toCombatantDto(Combatant c) {
        return new CombatantDto(
                c.getId(),
                c.getName(),
                c.getImageUrl(),
                c.getInitiativeScore(),
                c.getHp(),
                c.getCurrentHp(),
                c.getTempHp(),
                c.getArmorClass(),
                c.getBonusAc(),
                c.getHighestMissedAttack(),
                c.getIsMonster(),
                c.getIsNpc(),
                c.getUnknownHp(),
                c.getUnknownAc(),
                c.getDamageTaken(),
                c.getLastHitNumber(),
                c.getManualBloodied(),
                c.getManualDead(),
                c.getTurnOrder(),
                c.getIsBloodied(),
                c.getDeathSaveSuccesses(),
                c.getDeathSaveFailures()
        );
    }
}
