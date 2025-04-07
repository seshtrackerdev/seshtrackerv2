-- Core Identifiers use UUIDv7 for global uniqueness
-- Prefixes: usr_ (user), sesh_ (session), str_ (strain), dash_ (dashboard)

CREATE TABLE users (
  user_id TEXT PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL, -- Kush.Observer UUID
  created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
  updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
) WITHOUT ROWID;

CREATE TABLE sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  start_time INTEGER NOT NULL, -- Unix timestamp
  duration_minutes INTEGER NOT NULL,
  consumption_method TEXT CHECK(consumption_method IN ('vape', 'flower', 'edible', 'topical')),
  effects JSON NOT NULL DEFAULT '[]',
  notes TEXT,
  strain_id TEXT REFERENCES strains(strain_id),
  session_type TEXT CHECK(session_type IN ('recreational', 'medical', 'experimental')),
  FOREIGN KEY(user_id) REFERENCES users(user_id)
) WITHOUT ROWID;

CREATE TABLE strains (
  strain_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('sativa', 'indica', 'hybrid')),
  thc_percent REAL CHECK(thc_percent BETWEEN 0 AND 100),
  cbd_percent REAL CHECK(cbd_percent BETWEEN 0 AND 100),
  current_quantity_grams REAL NOT NULL DEFAULT 0,
  optimal_storage_temp TEXT,
  harvest_date INTEGER
) WITHOUT ROWID;

CREATE TABLE stock_movements (
  movement_id TEXT PRIMARY KEY,
  strain_id TEXT NOT NULL REFERENCES strains(strain_id),
  quantity_change REAL NOT NULL,
  movement_type TEXT CHECK(movement_type IN ('purchase', 'consumption', 'adjustment')),
  movement_date INTEGER DEFAULT (unixepoch()) NOT NULL,
  note TEXT
) WITHOUT ROWID;

CREATE TABLE dashboards (
  dashboard_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  layout_type TEXT CHECK(layout_type IN ('grid', 'list', 'custom')),
  last_accessed INTEGER DEFAULT (unixepoch()) NOT NULL
) WITHOUT ROWID;

CREATE TABLE dashboard_widgets (
  widget_id TEXT PRIMARY KEY,
  dashboard_id TEXT NOT NULL REFERENCES dashboards(dashboard_id) ON DELETE CASCADE,
  widget_type TEXT CHECK(widget_type IN ('session_timeline', 'inventory_status', 'consumption_trends')),
  widget_position INTEGER NOT NULL,
  widget_config JSON NOT NULL DEFAULT '{}'
) WITHOUT ROWID;

CREATE TABLE reports (
  report_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  report_type TEXT CHECK(report_type IN ('inventory', 'sessions', 'efficacy')),
  parameters JSON NOT NULL DEFAULT '{}',
  generated_at INTEGER DEFAULT (unixepoch()) NOT NULL,
  saved_config JSON NOT NULL DEFAULT '{}'
) WITHOUT ROWID;

-- Indexes for common access patterns
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_strains_user ON strains(user_id);
CREATE INDEX idx_stock_movements ON stock_movements(strain_id);
CREATE INDEX idx_dashboard_access ON dashboards(last_accessed);
CREATE INDEX idx_report_types ON reports(report_type); 