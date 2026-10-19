package com.dnd.tracker.service;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * One-time startup backfill for the charges feature added to companion abilities.
 * ddl-auto=update only ever adds columns/tables, it never adds a NOT NULL column to a
 * table that already has rows (H2 rejects it outright) - so used_charges has to be
 * added as nullable, backfilled, then locked down here, same pattern as
 * EncounterMigrationRunner's encounter_id fix.
 */
@Component
public class CompanionMigrationRunner implements ApplicationRunner {

    private final DataSource dataSource;

    public CompanionMigrationRunner(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) throws SQLException {
        try (Connection conn = dataSource.getConnection(); Statement stmt = conn.createStatement()) {
            stmt.execute("ALTER TABLE companion_entries ADD COLUMN IF NOT EXISTS used_charges INTEGER");
            stmt.execute("UPDATE companion_entries SET used_charges = 0 WHERE used_charges IS NULL");
            stmt.execute("ALTER TABLE companion_entries ALTER COLUMN used_charges SET NOT NULL");
            stmt.execute("ALTER TABLE companion_entries ALTER COLUMN used_charges SET DEFAULT 0");
        }
    }
}
