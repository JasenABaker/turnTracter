package com.dnd.tracker.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "companions")
public class Companion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String imageUrl;

    @Column(nullable = false)
    private Integer maxHp;

    @Column(nullable = false)
    private Integer currentHp;

    @Column(nullable = false)
    private Integer tempHp = 0;

    @Column(nullable = false)
    private Integer armorClass;

    // Additive, manually set/cleared by the GM (e.g. Shield spell, Barkskin) -
    // unlike temp HP, this is never automatically consumed.
    @Column(nullable = false)
    private Integer tempAc = 0;

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

    @OneToMany(mappedBy = "companion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CompanionEntry> entries = new ArrayList<>();

    public Companion() {}

    public void addEntry(CompanionEntry entry) {
        entries.add(entry);
        entry.setCompanion(this);
    }

    public void removeEntry(CompanionEntry entry) {
        entries.remove(entry);
        entry.setCompanion(null);
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Integer getMaxHp() { return maxHp; }
    public void setMaxHp(Integer maxHp) { this.maxHp = maxHp; }

    public Integer getCurrentHp() { return currentHp; }
    public void setCurrentHp(Integer currentHp) { this.currentHp = currentHp; }

    public Integer getTempHp() { return tempHp; }
    public void setTempHp(Integer tempHp) { this.tempHp = tempHp; }

    public Integer getArmorClass() { return armorClass; }
    public void setArmorClass(Integer armorClass) { this.armorClass = armorClass; }

    public Integer getTempAc() { return tempAc; }
    public void setTempAc(Integer tempAc) { this.tempAc = tempAc; }

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

    public List<CompanionEntry> getEntries() { return entries; }
    public void setEntries(List<CompanionEntry> entries) { this.entries = entries; }
}
