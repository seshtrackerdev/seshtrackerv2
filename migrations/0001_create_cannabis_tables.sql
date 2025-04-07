-- Migration: 0001_create_cannabis_tables
-- Description: Initial schema setup for SeshTracker cannabis tracking system
-- Date: 2024-06-10

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- Cannabis strains
CREATE TABLE IF NOT EXISTS strains (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('indica', 'sativa', 'hybrid')) NOT NULL,
  dominance TEXT CHECK(dominance IN ('indica', 'sativa', 'balanced')) NOT NULL,
  thc REAL NOT NULL,
  cbd REAL NOT NULL,
  effects TEXT, -- JSON array of effects
  medical_uses TEXT, -- JSON array of medical uses
  flavors TEXT, -- JSON array of flavors
  price_per_gram REAL,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- Strain terpenes
CREATE TABLE IF NOT EXISTS strain_terpenes (
  id TEXT PRIMARY KEY,
  strain_id TEXT NOT NULL,
  name TEXT NOT NULL,
  percentage REAL NOT NULL,
  FOREIGN KEY (strain_id) REFERENCES strains(id) ON DELETE CASCADE
);

-- Tracking sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  strain TEXT NOT NULL, -- Either strain name or ID reference
  strain_type TEXT CHECK(strain_type IN ('indica', 'sativa', 'hybrid')),
  dosage REAL NOT NULL,
  dosage_unit TEXT DEFAULT 'g',
  consumption_method TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration INTEGER, -- in minutes
  effects TEXT, -- JSON array of effect ratings
  overall_rating INTEGER CHECK(overall_rating BETWEEN 1 AND 10),
  notes TEXT,
  mood TEXT,
  location TEXT,
  tags TEXT, -- JSON array of tags
  inventory_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Inventory items
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  strain TEXT, -- Either strain ID or name
  strain_name TEXT,
  type TEXT CHECK(type IN ('indica', 'sativa', 'hybrid')) NOT NULL,
  thc REAL,
  cbd REAL,
  purchase_date TIMESTAMP NOT NULL,
  expiration_date TIMESTAMP,
  initial_quantity REAL NOT NULL,
  current_quantity REAL NOT NULL,
  unit_price REAL NOT NULL,
  total_cost REAL NOT NULL,
  dispensary TEXT,
  batch_number TEXT,
  image_url TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User cannabis preferences
CREATE TABLE IF NOT EXISTS cannabis_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  favorite_strains TEXT, -- JSON array of strain IDs
  preferred_types TEXT, -- JSON array of types
  preferred_effects TEXT, -- JSON array of effects
  avoided_effects TEXT, -- JSON array of effects
  medical_conditions TEXT, -- JSON array of conditions
  sensitivity_level TEXT CHECK(sensitivity_level IN ('Low', 'Medium', 'High')),
  dosage_preference REAL,
  consumption_frequency TEXT CHECK(consumption_frequency IN ('Daily', 'Weekly', 'Monthly', 'Rarely')),
  preferred_methods TEXT, -- JSON array of methods
  updated_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Analytics data (cached)
CREATE TABLE IF NOT EXISTS cannabis_analytics (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  period TEXT CHECK(period IN ('day', 'week', 'month', 'year', 'all')) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  total_sessions INTEGER NOT NULL,
  total_consumption REAL NOT NULL,
  average_dosage REAL NOT NULL,
  top_strains TEXT, -- JSON data
  effectiveness_map TEXT, -- JSON data
  cost_analysis TEXT, -- JSON data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admin analytics (cached)
CREATE TABLE IF NOT EXISTS admin_analytics (
  id TEXT PRIMARY KEY,
  total_users INTEGER NOT NULL,
  active_users TEXT, -- JSON with daily, weekly, monthly
  popular_strains TEXT, -- JSON data
  average_session_duration REAL NOT NULL,
  sessions_by_hour TEXT, -- JSON array of 24 hours
  sessions_by_day_of_week TEXT, -- JSON array of 7 days
  total_tracked_consumption REAL NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_strain ON sessions(strain);
CREATE INDEX idx_sessions_start_time ON sessions(start_time);
CREATE INDEX idx_inventory_user_id ON inventory(user_id);
CREATE INDEX idx_inventory_strain ON inventory(strain);
CREATE INDEX idx_strains_name ON strains(name);
CREATE INDEX idx_strains_type ON strains(type);
CREATE INDEX idx_users_email ON users(email);

-- Seed some test data
INSERT OR IGNORE INTO users (id, email, name) VALUES
  ('user-001', 'user1@seshtracker.com', 'Test User 1'),
  ('user-002', 'user2@seshtracker.com', 'Test User 2'),
  ('user-003', 'user3@seshtracker.com', 'Test User 3'); 