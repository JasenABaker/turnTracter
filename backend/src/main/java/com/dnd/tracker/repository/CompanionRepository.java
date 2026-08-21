package com.dnd.tracker.repository;

import com.dnd.tracker.model.Companion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CompanionRepository extends JpaRepository<Companion, UUID> {
    List<Companion> findAllByOrderByNameAsc();
}
