package com.dnd.tracker.repository;

import com.dnd.tracker.model.Encounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EncounterRepository extends JpaRepository<Encounter, UUID> {

    Optional<Encounter> findFirstByStatus(String status);

    List<Encounter> findAllByStatus(String status);

    List<Encounter> findAllByOrderByCreatedAtDesc();
}
