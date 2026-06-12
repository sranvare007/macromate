// SQLite connection + schema migrations. Opened synchronously at module load
// so the Redux store can hydrate its initial state from disk without an async
// loading gate (the dataset is tiny — a profile plus the day's meals).
//
// Schema mirrors the PRD §Key Data Models (profile / meals / meal_items),
// trimmed to what the client persists locally in v1. Targets are stored as
// columns on the single profile row; meals carry a local `day` key (see
// src/lib/dates.ts) for history grouping.

import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('macromate.db');

const DATABASE_VERSION = 1;

function migrate(database: SQLite.SQLiteDatabase): void {
  database.execSync('PRAGMA foreign_keys = ON');

  const row = database.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  if (version === 0) {
    database.execSync(`
      PRAGMA journal_mode = 'wal';

      CREATE TABLE profile (
        id                 INTEGER PRIMARY KEY CHECK (id = 1),
        name               TEXT    NOT NULL,
        email              TEXT    NOT NULL,
        goal_key           TEXT    NOT NULL,
        weight_kg          REAL    NOT NULL,
        height_cm          REAL    NOT NULL,
        age                INTEGER NOT NULL,
        sex                TEXT    NOT NULL,
        streak             INTEGER NOT NULL DEFAULT 0,
        onboarded          INTEGER NOT NULL DEFAULT 0,
        daily_kcal         REAL,
        daily_protein_g    REAL,
        daily_carbs_g      REAL,
        daily_fat_g        REAL,
        daily_fibre_g      REAL,
        created_at         INTEGER NOT NULL,
        targets_updated_at INTEGER
      );

      CREATE TABLE meals (
        id              TEXT    PRIMARY KEY,
        meal_type       TEXT    NOT NULL,
        day             TEXT    NOT NULL,
        time            TEXT    NOT NULL,
        logged_at       INTEGER NOT NULL,
        raw_input       TEXT,
        total_kcal      REAL    NOT NULL,
        total_protein_g REAL    NOT NULL,
        total_carbs_g   REAL    NOT NULL,
        total_fat_g     REAL    NOT NULL,
        total_fibre_g   REAL    NOT NULL
      );
      CREATE INDEX idx_meals_day ON meals (day);

      CREATE TABLE meal_items (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        meal_id          TEXT    NOT NULL REFERENCES meals (id) ON DELETE CASCADE,
        food_name        TEXT    NOT NULL,
        portion_size     TEXT,
        kcal             REAL    NOT NULL,
        protein_g        REAL    NOT NULL,
        carbs_g          REAL    NOT NULL,
        fat_g            REAL    NOT NULL,
        fibre_g          REAL    NOT NULL,
        confidence_score REAL
      );
      CREATE INDEX idx_meal_items_meal ON meal_items (meal_id);
    `);
    version = 1;
  }

  // Future migrations: bump DATABASE_VERSION and add `if (version === N)` blocks.

  database.execSync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

migrate(db);
