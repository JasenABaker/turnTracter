package com.dnd.tracker.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "combatants")
public class Combatant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String imageUrl;

    @Column(nullable = false)
    private Integer initiativeScore;

    @Column(nullable = false)
    private Integer hp;

    @Column(nullable = false)
    private Integer currentHp;

    @Column(nullable = false)
    private Integer tempHp = 0;

    @Column(nullable = false)
    private Integer armorClass;

    @Column(nullable = false)
    private Integer bonusAc = 0;

    @Column(nullable = false)
    private Integer highestMissedAttack = 0;

    @Column(nullable = false)
    private Boolean isMonster = false;

    @Column(nullable = false)
    private Boolean isNpc = false;

    @Column(nullable = false)
    private Boolean unknownHp = false;

    @Column(nullable = false)
    private Boolean unknownAc = false;

    @Column(nullable = false)
    private Integer damageTaken = 0;

    @Column(nullable = false)
    private Integer lastHitNumber = 0;

    @Column(nullable = false)
    private Boolean manualBloodied = false;

    @Column(nullable = false)
    private Boolean manualDead = false;

    @Column(nullable = false)
    private Integer turnOrder = 0;

    @Column(nullable = false)
    private Integer deathSaveSuccesses = 0;

    @Column(nullable = false)
    private Integer deathSaveFailures = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encounter_id")
    private Encounter encounter;

    private UUID sourcePlayerId;

    private UUID sourceTemplateId;

    @Column(length = 1000)
    private String activeConditions;

    private String size;

    private String creatureType;

    private String alignment;

    private String challengeRating;

    private String speed;

    @Column(nullable = false)
    private Integer strength = 10;

    @Column(nullable = false)
    private Integer dexterity = 10;

    @Column(nullable = false)
    private Integer constitution = 10;

    @Column(nullable = false)
    private Integer intelligence = 10;

    @Column(nullable = false)
    private Integer wisdom = 10;

    @Column(nullable = false)
    private Integer charisma = 10;

    @Column(length = 1000)
    private String damageImmunities;

    @Column(length = 1000)
    private String damageResistances;

    @Column(length = 1000)
    private String damageVulnerabilities;

    @Column(length = 1000)
    private String conditionImmunities;

    private String senses;

    private String languages;

    @OneToMany(mappedBy = "combatant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CombatantEntry> entries = new ArrayList<>();

    public Combatant() {}

    public void addEntry(CombatantEntry entry) {
        entries.add(entry);
        entry.setCombatant(this);
    }

    public void removeEntry(CombatantEntry entry) {
        entries.remove(entry);
        entry.setCombatant(null);
    }

    @Transient
    public boolean getIsBloodied() {
        if (manualBloodied != null && manualBloodied) return true;
        if (unknownHp != null && unknownHp) return false;
        return currentHp != null && hp != null && hp > 0 && currentHp <= hp / 2;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Integer getInitiativeScore() { return initiativeScore; }
    public void setInitiativeScore(Integer initiativeScore) { this.initiativeScore = initiativeScore; }

    public Integer getHp() { return hp; }
    public void setHp(Integer hp) { this.hp = hp; }

    public Integer getCurrentHp() { return currentHp; }
    public void setCurrentHp(Integer currentHp) { this.currentHp = currentHp; }

    public Integer getTempHp() { return tempHp; }
    public void setTempHp(Integer tempHp) { this.tempHp = tempHp; }

    public Integer getArmorClass() { return armorClass; }
    public void setArmorClass(Integer armorClass) { this.armorClass = armorClass; }

    public Integer getBonusAc() { return bonusAc; }
    public void setBonusAc(Integer bonusAc) { this.bonusAc = bonusAc; }

    public Integer getHighestMissedAttack() { return highestMissedAttack; }
    public void setHighestMissedAttack(Integer highestMissedAttack) { this.highestMissedAttack = highestMissedAttack; }

    public Boolean getIsMonster() { return isMonster; }
    public void setIsMonster(Boolean isMonster) { this.isMonster = isMonster; }

    public Boolean getIsNpc() { return isNpc; }
    public void setIsNpc(Boolean isNpc) { this.isNpc = isNpc; }

    public Boolean getUnknownHp() { return unknownHp; }
    public void setUnknownHp(Boolean unknownHp) { this.unknownHp = unknownHp; }

    public Boolean getUnknownAc() { return unknownAc; }
    public void setUnknownAc(Boolean unknownAc) { this.unknownAc = unknownAc; }

    public Integer getDamageTaken() { return damageTaken; }
    public void setDamageTaken(Integer damageTaken) { this.damageTaken = damageTaken; }

    public Integer getLastHitNumber() { return lastHitNumber; }
    public void setLastHitNumber(Integer lastHitNumber) { this.lastHitNumber = lastHitNumber; }

    public Boolean getManualBloodied() { return manualBloodied; }
    public void setManualBloodied(Boolean manualBloodied) { this.manualBloodied = manualBloodied; }

    public Boolean getManualDead() { return manualDead; }
    public void setManualDead(Boolean manualDead) { this.manualDead = manualDead; }

    public Integer getDeathSaveSuccesses() { return deathSaveSuccesses; }
    public void setDeathSaveSuccesses(Integer deathSaveSuccesses) { this.deathSaveSuccesses = deathSaveSuccesses; }

    public Integer getDeathSaveFailures() { return deathSaveFailures; }
    public void setDeathSaveFailures(Integer deathSaveFailures) { this.deathSaveFailures = deathSaveFailures; }

    public Integer getTurnOrder() { return turnOrder; }
    public void setTurnOrder(Integer turnOrder) { this.turnOrder = turnOrder; }

    public Encounter getEncounter() { return encounter; }
    public void setEncounter(Encounter encounter) { this.encounter = encounter; }

    public UUID getSourcePlayerId() { return sourcePlayerId; }
    public void setSourcePlayerId(UUID sourcePlayerId) { this.sourcePlayerId = sourcePlayerId; }

    public UUID getSourceTemplateId() { return sourceTemplateId; }
    public void setSourceTemplateId(UUID sourceTemplateId) { this.sourceTemplateId = sourceTemplateId; }

    public String getActiveConditions() { return activeConditions; }
    public void setActiveConditions(String activeConditions) { this.activeConditions = activeConditions; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getCreatureType() { return creatureType; }
    public void setCreatureType(String creatureType) { this.creatureType = creatureType; }

    public String getAlignment() { return alignment; }
    public void setAlignment(String alignment) { this.alignment = alignment; }

    public String getChallengeRating() { return challengeRating; }
    public void setChallengeRating(String challengeRating) { this.challengeRating = challengeRating; }

    public String getSpeed() { return speed; }
    public void setSpeed(String speed) { this.speed = speed; }

    public Integer getStrength() { return strength; }
    public void setStrength(Integer strength) { this.strength = strength; }

    public Integer getDexterity() { return dexterity; }
    public void setDexterity(Integer dexterity) { this.dexterity = dexterity; }

    public Integer getConstitution() { return constitution; }
    public void setConstitution(Integer constitution) { this.constitution = constitution; }

    public Integer getIntelligence() { return intelligence; }
    public void setIntelligence(Integer intelligence) { this.intelligence = intelligence; }

    public Integer getWisdom() { return wisdom; }
    public void setWisdom(Integer wisdom) { this.wisdom = wisdom; }

    public Integer getCharisma() { return charisma; }
    public void setCharisma(Integer charisma) { this.charisma = charisma; }

    public String getDamageImmunities() { return damageImmunities; }
    public void setDamageImmunities(String damageImmunities) { this.damageImmunities = damageImmunities; }

    public String getDamageResistances() { return damageResistances; }
    public void setDamageResistances(String damageResistances) { this.damageResistances = damageResistances; }

    public String getDamageVulnerabilities() { return damageVulnerabilities; }
    public void setDamageVulnerabilities(String damageVulnerabilities) { this.damageVulnerabilities = damageVulnerabilities; }

    public String getConditionImmunities() { return conditionImmunities; }
    public void setConditionImmunities(String conditionImmunities) { this.conditionImmunities = conditionImmunities; }

    public String getSenses() { return senses; }
    public void setSenses(String senses) { this.senses = senses; }

    public String getLanguages() { return languages; }
    public void setLanguages(String languages) { this.languages = languages; }

    public List<CombatantEntry> getEntries() { return entries; }
    public void setEntries(List<CombatantEntry> entries) { this.entries = entries; }
}
