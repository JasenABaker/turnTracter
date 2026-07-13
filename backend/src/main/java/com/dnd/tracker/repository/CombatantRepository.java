package com.dnd.tracker.repository;

import com.dnd.tracker.model.Combatant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CombatantRepository extends JpaRepository<Combatant, UUID> {

    List<Combatant> findByEncounterIdOrderByTurnOrderAsc(UUID encounterId);

    List<Combatant> findByEncounterIdOrderByInitiativeScoreDesc(UUID encounterId);
}
