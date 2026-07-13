package com.dnd.tracker.model;

import jakarta.persistence.*;
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
    @JoinColumn(name = "encounter_id", nullable = false)
    private Encounter encounter;

    public Combatant() {}

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
}
