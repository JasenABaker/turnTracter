package com.dnd.tracker.service;

import com.dnd.tracker.dto.*;
import com.dnd.tracker.model.Companion;
import com.dnd.tracker.model.CompanionEntry;
import com.dnd.tracker.repository.CompanionRepository;
import com.dnd.tracker.util.ListStringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CompanionService {

    private static final List<String> VALID_CATEGORIES = List.of("trait", "action", "bonus-action", "reaction");
    private static final List<String> VALID_RECHARGE_TYPES = List.of("day", "short-rest");

    private final CompanionRepository companionRepository;
    private final BestiaryService bestiaryService;

    public CompanionService(CompanionRepository companionRepository, BestiaryService bestiaryService) {
        this.companionRepository = companionRepository;
        this.bestiaryService = bestiaryService;
    }

    @Transactional(readOnly = true)
    public List<CompanionDto> getAll() {
        return companionRepository.findAllByOrderByNameAsc().stream().map(this::toCompanionDto).toList();
    }

    public Companion create(CreateCompanionRequest req) {
        Companion companion = new Companion();
        companion.setName(req.name());
        companion.setImageUrl(req.imageUrl());
        companion.setMaxHp(req.maxHp());
        companion.setCurrentHp(req.maxHp());
        companion.setArmorClass(req.armorClass());
        companion.setSpeed(req.speed());
        if (req.strength() != null) companion.setStrength(req.strength());
        if (req.dexterity() != null) companion.setDexterity(req.dexterity());
        if (req.constitution() != null) companion.setConstitution(req.constitution());
        if (req.intelligence() != null) companion.setIntelligence(req.intelligence());
        if (req.wisdom() != null) companion.setWisdom(req.wisdom());
        if (req.charisma() != null) companion.setCharisma(req.charisma());
        companion.setDamageImmunities(ListStringUtils.joinList(req.damageImmunities()));
        companion.setDamageResistances(ListStringUtils.joinList(req.damageResistances()));
        companion.setDamageVulnerabilities(ListStringUtils.joinList(req.damageVulnerabilities()));
        companion.setConditionImmunities(ListStringUtils.joinList(req.conditionImmunities()));
        companion.setSenses(req.senses());
        companion.setLanguages(req.languages());
        return companionRepository.save(companion);
    }

    public Companion update(UUID id, UpdateCompanionRequest req) {
        Companion companion = findOrThrow(id);
        if (req.name() != null) companion.setName(req.name());
        if (req.imageUrl() != null) companion.setImageUrl(req.imageUrl());
        if (req.maxHp() != null) companion.setMaxHp(req.maxHp());
        if (req.armorClass() != null) companion.setArmorClass(req.armorClass());
        if (req.speed() != null) companion.setSpeed(req.speed());
        if (req.strength() != null) companion.setStrength(req.strength());
        if (req.dexterity() != null) companion.setDexterity(req.dexterity());
        if (req.constitution() != null) companion.setConstitution(req.constitution());
        if (req.intelligence() != null) companion.setIntelligence(req.intelligence());
        if (req.wisdom() != null) companion.setWisdom(req.wisdom());
        if (req.charisma() != null) companion.setCharisma(req.charisma());
        if (req.damageImmunities() != null) companion.setDamageImmunities(ListStringUtils.joinList(req.damageImmunities()));
        if (req.damageResistances() != null) companion.setDamageResistances(ListStringUtils.joinList(req.damageResistances()));
        if (req.damageVulnerabilities() != null) companion.setDamageVulnerabilities(ListStringUtils.joinList(req.damageVulnerabilities()));
        if (req.conditionImmunities() != null) companion.setConditionImmunities(ListStringUtils.joinList(req.conditionImmunities()));
        if (req.senses() != null) companion.setSenses(req.senses());
        if (req.languages() != null) companion.setLanguages(req.languages());
        return companionRepository.save(companion);
    }

    public Companion updateHp(UUID id, CompanionHpUpdateRequest req) {
        Companion companion = findOrThrow(id);
        if (req.currentHp() != null) companion.setCurrentHp(req.currentHp());
        if (req.tempHp() != null) companion.setTempHp(req.tempHp());
        return companionRepository.save(companion);
    }

    public Companion updateTempAc(UUID id, Integer tempAc) {
        Companion companion = findOrThrow(id);
        if (tempAc != null) companion.setTempAc(Math.max(0, tempAc));
        return companionRepository.save(companion);
    }

    public void delete(UUID id) {
        Companion companion = findOrThrow(id);
        companionRepository.delete(companion);
    }

    public Companion addEntry(UUID companionId, CompanionEntryRequest req) {
        Companion companion = findOrThrow(companionId);
        String category = validateCategory(req.category());
        CompanionEntry entry = new CompanionEntry();
        entry.setCategory(category);
        entry.setName(req.name());
        entry.setDescription(req.description());
        entry.setRange(req.range());
        entry.setHitOrDc(req.hitOrDc());
        entry.setDamage(req.damage());
        entry.setMaxCharges(req.maxCharges());
        entry.setRechargeType(validateRechargeType(req.rechargeType()));
        entry.setUsedCharges(0);
        companion.addEntry(entry);
        return companionRepository.save(companion);
    }

    public Companion updateEntry(UUID companionId, UUID entryId, CompanionEntryRequest req) {
        Companion companion = findOrThrow(companionId);
        CompanionEntry entry = companion.getEntries().stream()
                .filter(e -> e.getId().equals(entryId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Entry not found: " + entryId));
        if (req.category() != null) entry.setCategory(validateCategory(req.category()));
        if (req.name() != null) entry.setName(req.name());
        if (req.description() != null) entry.setDescription(req.description());
        if (req.range() != null) entry.setRange(req.range());
        if (req.hitOrDc() != null) entry.setHitOrDc(req.hitOrDc());
        if (req.damage() != null) entry.setDamage(req.damage());
        if (req.maxCharges() != null) {
            entry.setMaxCharges(req.maxCharges());
            entry.setUsedCharges(Math.min(entry.getUsedCharges(), req.maxCharges()));
        }
        if (req.rechargeType() != null) entry.setRechargeType(validateRechargeType(req.rechargeType()));
        return companionRepository.save(companion);
    }

    public Companion updateEntryCharges(UUID companionId, UUID entryId, Integer usedCharges) {
        Companion companion = findOrThrow(companionId);
        CompanionEntry entry = companion.getEntries().stream()
                .filter(e -> e.getId().equals(entryId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Entry not found: " + entryId));
        int max = entry.getMaxCharges() != null ? entry.getMaxCharges() : 0;
        entry.setUsedCharges(Math.max(0, Math.min(max, usedCharges != null ? usedCharges : 0)));
        return companionRepository.save(companion);
    }

    public Companion resetCharges(UUID companionId, String scope) {
        Companion companion = findOrThrow(companionId);
        boolean resetAll = !"short-rest".equals(scope);
        for (CompanionEntry entry : companion.getEntries()) {
            if (entry.getMaxCharges() == null || entry.getMaxCharges() <= 0) continue;
            if (resetAll || "short-rest".equals(entry.getRechargeType())) {
                entry.setUsedCharges(0);
            }
        }
        return companionRepository.save(companion);
    }

    public Companion deleteEntry(UUID companionId, UUID entryId) {
        Companion companion = findOrThrow(companionId);
        CompanionEntry entry = companion.getEntries().stream()
                .filter(e -> e.getId().equals(entryId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Entry not found: " + entryId));
        companion.removeEntry(entry);
        return companionRepository.save(companion);
    }

    public Companion importFromBestiary(String name) {
        Companion companion = bestiaryService.fetchCompanion(name);
        return companionRepository.save(companion);
    }

    public CompanionDto toCompanionDto(Companion c) {
        return new CompanionDto(
                c.getId(),
                c.getName(),
                c.getImageUrl(),
                c.getMaxHp(),
                c.getCurrentHp(),
                c.getTempHp(),
                c.getArmorClass(),
                c.getTempAc(),
                c.getSpeed(),
                c.getStrength(),
                c.getDexterity(),
                c.getConstitution(),
                c.getIntelligence(),
                c.getWisdom(),
                c.getCharisma(),
                ListStringUtils.splitList(c.getDamageImmunities()),
                ListStringUtils.splitList(c.getDamageResistances()),
                ListStringUtils.splitList(c.getDamageVulnerabilities()),
                ListStringUtils.splitList(c.getConditionImmunities()),
                c.getSenses(),
                c.getLanguages(),
                c.getEntries().stream().map(this::toEntryDto).toList()
        );
    }

    private CompanionEntryDto toEntryDto(CompanionEntry e) {
        return new CompanionEntryDto(e.getId(), e.getCategory(), e.getName(), e.getDescription(),
                e.getRange(), e.getHitOrDc(), e.getDamage(), e.getMaxCharges(), e.getUsedCharges(), e.getRechargeType());
    }

    private Companion findOrThrow(UUID id) {
        return companionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Companion not found: " + id));
    }

    private String validateCategory(String category) {
        if (category == null || !VALID_CATEGORIES.contains(category)) {
            throw new IllegalArgumentException("Invalid category: " + category);
        }
        return category;
    }

    private String validateRechargeType(String rechargeType) {
        if (rechargeType == null || rechargeType.isBlank()) return null;
        if (!VALID_RECHARGE_TYPES.contains(rechargeType)) {
            throw new IllegalArgumentException("Invalid recharge type: " + rechargeType);
        }
        return rechargeType;
    }
}
