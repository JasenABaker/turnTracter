package com.dnd.tracker.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "saved_combatants")
public class SavedCombatant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String imageUrl;

    @Column(nullable = false)
    private Integer hp;

    @Column(nullable = false)
    private Integer armorClass;

    @Column(nullable = false)
    private Boolean isMonster = false;

    @Column(nullable = false)
    private Boolean isNpc = false;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Integer getHp() { return hp; }
    public void setHp(Integer hp) { this.hp = hp; }

    public Integer getArmorClass() { return armorClass; }
    public void setArmorClass(Integer armorClass) { this.armorClass = armorClass; }

    public Boolean getIsMonster() { return isMonster; }
    public void setIsMonster(Boolean isMonster) { this.isMonster = isMonster; }

    public Boolean getIsNpc() { return isNpc; }
    public void setIsNpc(Boolean isNpc) { this.isNpc = isNpc; }
}
