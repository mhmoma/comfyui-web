
DROP TABLE IF EXISTS characters;
DROP TABLE IF EXISTS series;
CREATE TABLE IF NOT EXISTS series (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  count INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  series_id TEXT NOT NULL,
  trigger_text TEXT NOT NULL,
  name TEXT NOT NULL,
  thumb_url TEXT DEFAULT '',
  count INTEGER DEFAULT 0,
  lora_url TEXT DEFAULT '',
  tags TEXT DEFAULT '',
  FOREIGN KEY (series_id) REFERENCES series(id)
);
CREATE INDEX IF NOT EXISTS idx_chars_series ON characters(series_id);
CREATE INDEX IF NOT EXISTS idx_chars_count ON characters(count DESC);
CREATE INDEX IF NOT EXISTS idx_chars_name ON characters(name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_chars_trigger ON characters(trigger_text COLLATE NOCASE);
