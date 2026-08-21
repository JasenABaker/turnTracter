package com.dnd.tracker.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "combatant_entries")
public class CombatantEntry {

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "combatant_id", nullable = false)
    private Combatant combatant;

    public CombatantEntry() {}

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

    public Combatant getCombatant() { return combatant; }
    public void setCombatant(Combatant combatant) { this.combatant = combatant; }
}
