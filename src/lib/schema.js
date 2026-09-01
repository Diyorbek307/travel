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
      -- Ссылка на страницу файла: CC BY и CC BY-SA требуют указать не только
      -- автора и лицензию, но и откуда снимок взят.
      source  TEXT,
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

    -- Платное размещение ресторанов/кафе/зон отдыха в топе подборки —
    -- трейт-таблица поверх pois, как museums. Для остальных категорий
    -- строки нет вовсе, а не 0 по умолчанию.
    CREATE TABLE IF NOT EXISTS venue_details (
      poi_id             INTEGER NOT NULL UNIQUE REFERENCES pois(id) ON DELETE CASCADE,
      sponsored_priority INTEGER NOT NULL DEFAULT 0
    );

    -- Заявка на столик, не подтверждённая бронь: интеграции с
    -- POS-системами заведений нет, администратор перезванивает сам.
    CREATE TABLE IF NOT EXISTS reservations (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      poi_id       INTEGER NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
      name         TEXT NOT NULL,
      phone        TEXT NOT NULL,
      party_size   INTEGER NOT NULL,
      requested_at TEXT NOT NULL,
      note         TEXT,
      status       TEXT NOT NULL DEFAULT 'new',
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_reservations_poi ON reservations(poi_id, created_at);

    -- Праздники и фестивали. Таблица названа festivals, а не events:
    -- events уже занята обезличенной аналитикой.
    --
    -- Даты хранятся как месяц и день отдельно от года: Навруз — всегда
    -- 21 марта, и записывать ему год значило бы каждый январь править
    -- руками все ежегодные праздники. У фестивалей с плавающей датой год
    -- указывается явно в year.
    CREATE TABLE IF NOT EXISTS festivals (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      slug       TEXT NOT NULL UNIQUE,
      city_id    INTEGER REFERENCES cities(id) ON DELETE SET NULL,
      month      INTEGER NOT NULL,
      day        INTEGER,
      year       INTEGER,
      days       INTEGER NOT NULL DEFAULT 1,
      cover      TEXT,
      sort       INTEGER NOT NULL DEFAULT 0,
      is_active  INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS festival_translations (
      festival_id INTEGER NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
      lang        TEXT NOT NULL,
      name        TEXT NOT NULL,
      description TEXT,
      PRIMARY KEY (festival_id, lang)
    );

    -- Рекламные блоки. Переводов нет намеренно: креатив приходит от
    -- рекламодателя на конкретном языке, а не переводится нами. lang = NULL
    -- означает «показывать всем». Даты размещения обязательны для
    -- открутки по оплаченному периоду, счётчики — для отчёта рекламодателю.
    CREATE TABLE IF NOT EXISTS ad_banners (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      slot        TEXT NOT NULL,
      lang        TEXT,
      title       TEXT NOT NULL,
      subtitle    TEXT,
      cta_label   TEXT,
      url         TEXT NOT NULL,
      weight      INTEGER NOT NULL DEFAULT 0,
      starts_at   TEXT,
      ends_at     TEXT,
      impressions INTEGER NOT NULL DEFAULT 0,
      clicks      INTEGER NOT NULL DEFAULT 0,
      is_active   INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_ads_slot ON ad_banners(slot, is_active, weight);

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
