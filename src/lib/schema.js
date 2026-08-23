/** DDL платформы. Один источник правды для приложения и для сидера. */
export const SCHEMA_SQL = `
    CREATE TABLE IF NOT EXISTS cities (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      slug      TEXT NOT NULL UNIQUE,
      lat       REAL NOT NULL,
      lon       REAL NOT NULL,
      zoom      INTEGER NOT NULL DEFAULT 13,
      cover     TEXT,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS city_translations (
      city_id     INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      lang        TEXT NOT NULL,
      name        TEXT NOT NULL,
      description TEXT,
      PRIMARY KEY (city_id, lang)
    );

    CREATE TABLE IF NOT EXISTS pois (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id       INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      slug          TEXT NOT NULL UNIQUE,
      category      TEXT NOT NULL,
      themes        TEXT NOT NULL DEFAULT '[]',
      lat           REAL NOT NULL,
      lon           REAL NOT NULL,
      price_uzs     INTEGER NOT NULL DEFAULT 0,
      is_free       INTEGER NOT NULL DEFAULT 1,
      opening_hours TEXT,
      avg_visit_min INTEGER NOT NULL DEFAULT 30,
      rating        REAL NOT NULL DEFAULT 4.5,
      popularity    REAL NOT NULL DEFAULT 0.5,
      cover         TEXT,
      phone         TEXT,
      website       TEXT,
      is_active     INTEGER NOT NULL DEFAULT 1
    );
    CREATE INDEX IF NOT EXISTS idx_pois_city ON pois(city_id, category, is_active);

    CREATE TABLE IF NOT EXISTS poi_translations (
      poi_id     INTEGER NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
      lang       TEXT NOT NULL,
      name       TEXT NOT NULL,
      short_desc TEXT,
      full_story TEXT,
      PRIMARY KEY (poi_id, lang)
    );

    CREATE TABLE IF NOT EXISTS poi_media (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      poi_id  INTEGER NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
      url     TEXT NOT NULL,
      caption TEXT,
      author  TEXT,
      license TEXT,
      sort    INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS poi_audio (
      poi_id       INTEGER NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
      lang         TEXT NOT NULL,
      url          TEXT NOT NULL,
      duration_sec INTEGER NOT NULL DEFAULT 0,
      narrator     TEXT,
      PRIMARY KEY (poi_id, lang)
    );

    CREATE TABLE IF NOT EXISTS museums (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      poi_id INTEGER NOT NULL UNIQUE REFERENCES pois(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exhibits (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      museum_id INTEGER NOT NULL REFERENCES museums(id) ON DELETE CASCADE,
      number    TEXT NOT NULL,
      period    TEXT,
      origin    TEXT,
      cover     TEXT,
      sort      INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS exhibit_translations (
      exhibit_id INTEGER NOT NULL REFERENCES exhibits(id) ON DELETE CASCADE,
      lang       TEXT NOT NULL,
      name       TEXT NOT NULL,
      short_desc TEXT,
      full_story TEXT,
      PRIMARY KEY (exhibit_id, lang)
    );

    CREATE TABLE IF NOT EXISTS exhibit_audio (
      exhibit_id   INTEGER NOT NULL REFERENCES exhibits(id) ON DELETE CASCADE,
      lang         TEXT NOT NULL,
      url          TEXT NOT NULL,
      duration_sec INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (exhibit_id, lang)
    );

    -- QR ведёт на /s/<code>, а не прямо на объект: код можно перепривязать,
    -- не перепечатывая табличку, и он даёт статистику сканирований.
    CREATE TABLE IF NOT EXISTS qr_codes (
      code        TEXT PRIMARY KEY,
      target_type TEXT NOT NULL,
      target_id   INTEGER NOT NULL,
      scans       INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_qr_target ON qr_codes(target_type, target_id);

    CREATE TABLE IF NOT EXISTS tours (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      slug        TEXT NOT NULL UNIQUE,
      city_id     INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      kind        TEXT NOT NULL DEFAULT 'curated',
      mode        TEXT NOT NULL DEFAULT 'walk',
      cover       TEXT,
      total_min   INTEGER NOT NULL DEFAULT 0,
      sort        INTEGER NOT NULL DEFAULT 0,
      is_active   INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS tour_translations (
      tour_id     INTEGER NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
      lang        TEXT NOT NULL,
      title       TEXT NOT NULL,
      description TEXT,
      PRIMARY KEY (tour_id, lang)
    );

    CREATE TABLE IF NOT EXISTS tour_stops (
      tour_id     INTEGER NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
      poi_id      INTEGER NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
      order_index INTEGER NOT NULL,
      stay_min    INTEGER NOT NULL DEFAULT 30,
      PRIMARY KEY (tour_id, order_index)
    );

    -- Обезличенная аналитика (п. 17): только хэш сессии, без персональных данных.
    CREATE TABLE IF NOT EXISTS events (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      type         TEXT NOT NULL,
      city_id      INTEGER,
      poi_id       INTEGER,
      lang         TEXT,
      session_hash TEXT,
      meta         TEXT,
      ts           TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(type, ts);
  `;
