package com.dnd.tracker.repository;

import com.dnd.tracker.model.SavedCombatant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SavedCombatantRepository extends JpaRepository<SavedCombatant, UUID> {

    List<SavedCombatant> findAllByOrderByNameAsc();

    boolean existsByNameAndHpAndArmorClassAndIsMonsterAndIsNpc(
            String name, Integer hp, Integer armorClass, Boolean isMonster, Boolean isNpc);
}
