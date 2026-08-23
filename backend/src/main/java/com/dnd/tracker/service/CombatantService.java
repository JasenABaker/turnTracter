package com.dnd.tracker.service;

import com.dnd.tracker.dto.CombatantEntryRequest;
import com.dnd.tracker.dto.UpdateCombatantStatBlockRequest;
import com.dnd.tracker.model.Combatant;
import com.dnd.tracker.model.CombatantEntry;
import com.dnd.tracker.model.Encounter;
import com.dnd.tracker.model.Player;
import com.dnd.tracker.repository.CombatantRepository;
import com.dnd.tracker.util.ListStringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CombatantService {

    private static final List<String> VALID_CATEGORIES =
            List.of("trait", "action", "bonus-action", "reaction", "legendary-action", "lair-action");

    private final CombatantRepository combatantRepository;

    public CombatantService(CombatantRepository combatantRepository) {
        this.combatantRepository = combatantRepository;
    }

    public Combatant findOrThrow(UUID id) {
        return combatantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Combatant not found: " + id));
    }

    public Combatant updateStatBlock(UUID id, UpdateCombatantStatBlockRequest req) {
        Combatant combatant = findOrThrow(id);
        if (req.name() != null) combatant.setName(req.name());
        if (req.imageUrl() != null) combatant.setImageUrl(req.imageUrl());
        if (req.size() != null) combatant.setSize(req.size());
        if (req.creatureType() != null) combatant.setCreatureType(req.creatureType());
        if (req.alignment() != null) combatant.setAlignment(req.alignment());
        if (req.challengeRating() != null) combatant.setChallengeRating(req.challengeRating());
        if (req.speed() != null) combatant.setSpeed(req.speed());
        if (req.strength() != null) combatant.setStrength(req.strength());
        if (req.dexterity() != null) combatant.setDexterity(req.dexterity());
        if (req.constitution() != null) combatant.setConstitution(req.constitution());
        if (req.intelligence() != null) combatant.setIntelligence(req.intelligence());
        if (req.wisdom() != null) combatant.setWisdom(req.wisdom());
        if (req.charisma() != null) combatant.setCharisma(req.charisma());
        if (req.damageImmunities() != null) combatant.setDamageImmunities(ListStringUtils.joinList(req.damageImmunities()));
        if (req.damageResistances() != null) combatant.setDamageResistances(ListStringUtils.joinList(req.damageResistances()));
        if (req.damageVulnerabilities() != null) combatant.setDamageVulnerabilities(ListStringUtils.joinList(req.damageVulnerabilities()));
        if (req.conditionImmunities() != null) combatant.setConditionImmunities(ListStringUtils.joinList(req.conditionImmunities()));
        if (req.senses() != null) combatant.setSenses(req.senses());
        if (req.languages() != null) combatant.setLanguages(req.languages());
        return combatantRepository.save(combatant);
    }

    public Combatant addEntry(UUID combatantId, CombatantEntryRequest req) {
        Combatant combatant = findOrThrow(combatantId);
        String category = validateCategory(req.category());
        CombatantEntry entry = new CombatantEntry();
        entry.setCategory(category);
        entry.setName(req.name());
        entry.setDescription(req.description());
        entry.setRange(req.range());
        entry.setHitOrDc(req.hitOrDc());
        entry.setDamage(req.damage());
        combatant.addEntry(entry);
        return combatantRepository.save(combatant);
    }

    public Combatant updateEntry(UUID combatantId, UUID entryId, CombatantEntryRequest req) {
        Combatant combatant = findOrThrow(combatantId);
        CombatantEntry entry = combatant.getEntries().stream()
                .filter(e -> e.getId().equals(entryId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Entry not found: " + entryId));
        if (req.category() != null) entry.setCategory(validateCategory(req.category()));
        if (req.name() != null) entry.setName(req.name());
        if (req.description() != null) entry.setDescription(req.description());
        if (req.range() != null) entry.setRange(req.range());
        if (req.hitOrDc() != null) entry.setHitOrDc(req.hitOrDc());
        if (req.damage() != null) entry.setDamage(req.damage());
        return combatantRepository.save(combatant);
    }

    public Combatant deleteEntry(UUID combatantId, UUID entryId) {
        Combatant combatant = findOrThrow(combatantId);
        CombatantEntry entry = combatant.getEntries().stream()
                .filter(e -> e.getId().equals(entryId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Entry not found: " + entryId));
        combatant.removeEntry(entry);
        return combatantRepository.save(combatant);
    }

    public Combatant updateActiveConditions(UUID id, List<String> conditions) {
        Combatant combatant = findOrThrow(id);
        combatant.setActiveConditions(ListStringUtils.joinList(conditions));
        return combatantRepository.save(combatant);
    }

    public Combatant createTemplate(Combatant draft) {
        draft.setEncounter(null);
        draft.setInitiativeScore(0);
        return combatantRepository.save(draft);
    }

    public Combatant cloneIntoEncounter(UUID templateId, Encounter target, Integer initiativeScore, String nameOverride,
                                         Boolean unknownHpOverride, Boolean unknownAcOverride) {
        Combatant template = findOrThrow(templateId);

        boolean unknownHp = unknownHpOverride != null ? unknownHpOverride
                : (template.getUnknownHp() != null && template.getUnknownHp());
        boolean unknownAc = unknownAcOverride != null ? unknownAcOverride
                : (template.getUnknownAc() != null && template.getUnknownAc());

        Combatant clone = new Combatant();
        clone.setName(nameOverride != null ? nameOverride : template.getName());
        clone.setImageUrl(template.getImageUrl());
        clone.setInitiativeScore(initiativeScore != null ? initiativeScore : 0);
        clone.setHp(unknownHp ? 0 : template.getHp());
        clone.setCurrentHp(unknownHp ? 0 : template.getHp());
        clone.setArmorClass(unknownAc ? 0 : template.getArmorClass());
        clone.setIsMonster(template.getIsMonster());
        clone.setIsNpc(template.getIsNpc());
        clone.setUnknownHp(unknownHp);
        clone.setUnknownAc(unknownAc);
        clone.setSize(template.getSize());
        clone.setCreatureType(template.getCreatureType());
        clone.setAlignment(template.getAlignment());
        clone.setChallengeRating(template.getChallengeRating());
        clone.setSpeed(template.getSpeed());
        clone.setStrength(template.getStrength());
        clone.setDexterity(template.getDexterity());
        clone.setConstitution(template.getConstitution());
        clone.setIntelligence(template.getIntelligence());
        clone.setWisdom(template.getWisdom());
        clone.setCharisma(template.getCharisma());
        clone.setDamageImmunities(template.getDamageImmunities());
        clone.setDamageResistances(template.getDamageResistances());
        clone.setDamageVulnerabilities(template.getDamageVulnerabilities());
        clone.setConditionImmunities(template.getConditionImmunities());
        clone.setSenses(template.getSenses());
        clone.setLanguages(template.getLanguages());
        clone.setEncounter(target);
        clone.setSourceTemplateId(template.getId());

        for (CombatantEntry templateEntry : template.getEntries()) {
            CombatantEntry entry = new CombatantEntry();
            entry.setCategory(templateEntry.getCategory());
            entry.setName(templateEntry.getName());
            entry.setDescription(templateEntry.getDescription());
            entry.setRange(templateEntry.getRange());
            entry.setHitOrDc(templateEntry.getHitOrDc());
            entry.setDamage(templateEntry.getDamage());
            clone.addEntry(entry);
        }

        return combatantRepository.save(clone);
    }

    public Combatant createFromPlayer(Player player, Encounter target, Integer initiativeScore) {
        Combatant combatant = new Combatant();
        combatant.setName(player.getName());
        combatant.setImageUrl(player.getImageUrl());
        combatant.setInitiativeScore(initiativeScore != null ? initiativeScore : 0);
        combatant.setHp(player.getMaxHp());
        combatant.setCurrentHp(player.getMaxHp());
        combatant.setArmorClass(player.getArmorClass());
        combatant.setIsMonster(false);
        combatant.setIsNpc(false);
        combatant.setEncounter(target);
        combatant.setSourcePlayerId(player.getId());
        return combatantRepository.save(combatant);
    }

    private String validateCategory(String category) {
        if (category == null || !VALID_CATEGORIES.contains(category)) {
            throw new IllegalArgumentException("Invalid category: " + category);
        }
        return category;
    }
}
