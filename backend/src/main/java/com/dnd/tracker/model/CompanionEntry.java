package com.dnd.tracker.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "companion_entries")
public class CompanionEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 2000)
    private String description;

    private String range;

    private String hitOrDc;

    private String damage;

    private Integer maxCharges;

    @Column(nullable = false)
    private Integer usedCharges = 0;

    private String rechargeType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "companion_id", nullable = false)
    private Companion companion;

    public CompanionEntry() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getRange() { return range; }
    public void setRange(String range) { this.range = range; }

    public String getHitOrDc() { return hitOrDc; }
    public void setHitOrDc(String hitOrDc) { this.hitOrDc = hitOrDc; }

    public String getDamage() { return damage; }
    public void setDamage(String damage) { this.damage = damage; }

    public Integer getMaxCharges() { return maxCharges; }
    public void setMaxCharges(Integer maxCharges) { this.maxCharges = maxCharges; }

    public Integer getUsedCharges() { return usedCharges; }
    public void setUsedCharges(Integer usedCharges) { this.usedCharges = usedCharges; }

    public String getRechargeType() { return rechargeType; }
    public void setRechargeType(String rechargeType) { this.rechargeType = rechargeType; }

    public Companion getCompanion() { return companion; }
    public void setCompanion(Companion companion) { this.companion = companion; }
}
