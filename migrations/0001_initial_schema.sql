-- Initial schema for Sesh-Tracker.com
-- This creates the core tables for session tracking and inventory management

-- Sessions table - Stores data about cannabis consumption sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  start_time TEXT NOT NULL, -- ISO date string
  end_time TEXT, -- ISO date string, null if ongoing
  consumption_method TEXT NOT NULL, -- 'Flower', 'Vape', 'Concentrate', 'Edible', etc.
  setting_location TEXT,
  setting_social TEXT,
  setting_environment TEXT, -- JSON array as string
  rating INTEGER, -- 1-10 scale
  notes TEXT,
  tags TEXT, -- JSON array as string
  is_public BOOLEAN DEFAULT false,
  created_at TEXT NOT NULL, -- ISO date string
  updated_at TEXT NOT NULL -- ISO date string
);

-- Create index on user_id for faster querying
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_start_time ON sessions(start_time);

-- Session products - Products used in a session
CREATE TABLE session_products (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  inventory_item_id TEXT, -- Can be null for products not in inventory
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Strain', 'Concentrate', 'Edible', 'Other'
  amount REAL NOT NULL,
  unit TEXT NOT NULL,
  thc_content REAL,
  cbd_content REAL,
  terpenes TEXT, -- JSON object as string
  cost_per_unit REAL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Create index on session_id
CREATE INDEX idx_session_products_session_id ON session_products(session_id);
CREATE INDEX idx_session_products_inventory_item_id ON session_products(inventory_item_id);

-- Mood entries - Track mood before, during, and after sessions
CREATE TABLE mood_entries (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  timestamp TEXT NOT NULL, -- ISO date string
  type TEXT NOT NULL, -- 'before', 'during', 'after'
  mood TEXT NOT NULL,
  intensity INTEGER NOT NULL, -- 1-10 scale
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Create index on session_id
CREATE INDEX idx_mood_entries_session_id ON mood_entries(session_id);

-- Session effects - Track effects experienced during a session
CREATE TABLE session_effects (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'positive', 'negative', 'medical'
  intensity INTEGER NOT NULL, -- 1-10 scale
  onset INTEGER, -- Minutes after session start
  duration INTEGER, -- Minutes
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Create index on session_id
CREATE INDEX idx_session_effects_session_id ON session_effects(session_id);

-- Inventory items - Track cannabis products in inventory
CREATE TABLE inventory_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Flower', 'Pre-roll', 'Vape', 'Concentrate', etc.
  strain_name TEXT,
  strain_type TEXT, -- 'Sativa', 'Indica', 'Hybrid', 'CBD'
  strain_dominance INTEGER, -- -10 to 10 scale (Indica to Sativa)
  brand TEXT,
  
  -- Quantity tracking
  initial_quantity REAL NOT NULL,
  current_quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  
  -- Purchase information
  purchase_date TEXT, -- ISO date string
  price REAL,
  retailer TEXT,
  receipt_image TEXT,
  batch_id TEXT,
  
  -- Product details
  thc_content REAL,
  cbd_content REAL,
  terpenes TEXT, -- JSON object as string
  grow_method TEXT,
  harvest_date TEXT, -- ISO date string
  cultivator TEXT,
  
  notes TEXT,
  photos TEXT, -- JSON array as string
  tags TEXT, -- JSON array as string
  is_favorite BOOLEAN DEFAULT false,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Create index on user_id
CREATE INDEX idx_inventory_items_user_id ON inventory_items(user_id);
CREATE INDEX idx_inventory_items_type ON inventory_items(type);

-- Inventory consumption - Track when inventory is consumed
CREATE TABLE inventory_consumption (
  id TEXT PRIMARY KEY,
  inventory_item_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  amount_used REAL NOT NULL,
  remaining_amount REAL NOT NULL,
  timestamp TEXT NOT NULL, -- ISO date string
  created_at TEXT NOT NULL,
  FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_inventory_consumption_item_id ON inventory_consumption(inventory_item_id);
CREATE INDEX idx_inventory_consumption_session_id ON inventory_consumption(session_id);

-- User preferences - Store user-specific settings
CREATE TABLE user_preferences (
  user_id TEXT PRIMARY KEY,
  dashboard_layout TEXT, -- JSON object as string
  theme TEXT DEFAULT 'dark',
  notification_settings TEXT, -- JSON object as string
  usage_goals TEXT, -- JSON object as string
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
); 