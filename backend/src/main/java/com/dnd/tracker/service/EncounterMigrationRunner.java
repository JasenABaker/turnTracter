package com.dnd.tracker.service;

import com.dnd.tracker.model.Combatant;
import com.dnd.tracker.model.Encounter;
import com.dnd.tracker.repository.CombatantRepository;
import com.dnd.tracker.repository.EncounterRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;

/**
 * One-time startup backfill for encounters created before named, multi-encounter
 * support existed. Legacy rows have name=null/status=null; give them a name and infer
 * status from whether they already have combatants, so an in-progress game isn't
 * silently orphaned by the upgrade. Also relaxes combatants.encounter_id to nullable —
 * ddl-auto=update only ever adds columns/tables, it never loosens an existing NOT NULL
 * constraint, so encounter-less "template" combatants can't be inserted without this.
 */
@Component
public class EncounterMigrationRunner implements ApplicationRunner {

    private final EncounterRepository encounterRepository;
    private final CombatantRepository combatantRepository;
    private final DataSource dataSource;

    public EncounterMigrationRunner(EncounterRepository encounterRepository, CombatantRepository combatantRepository,
                                     DataSource dataSource) {
        this.encounterRepository = encounterRepository;
        this.combatantRepository = combatantRepository;
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) throws SQLException {
        try (Connection conn = dataSource.getConnection(); Statement stmt = conn.createStatement()) {
            stmt.execute("ALTER TABLE combatants ALTER COLUMN encounter_id SET NULL");
        }

        List<Encounter> all = encounterRepository.findAll();
        boolean changed = false;

        for (Encounter e : all) {
            if (e.getName() == null) {
                e.setName("Untitled Encounter");
                changed = true;
            }
            if (e.getStatus() == null) {
                List<Combatant> combatants = combatantRepository.findByEncounterIdOrderByTurnOrderAsc(e.getId());
                e.setStatus(combatants.isEmpty() ? "draft" : "active");
                changed = true;
            }
        }

        if (changed) {
            encounterRepository.saveAll(all);
        }
    }
}
