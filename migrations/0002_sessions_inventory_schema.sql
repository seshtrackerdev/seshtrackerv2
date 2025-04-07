-- Drop existing tables (if migrating)
DROP TABLE IF EXISTS session_inventory;
DROP TABLE IF EXISTS inventory_items;
DROP TABLE IF EXISTS sessions;

-- Create inventory_items table
CREATE TABLE inventory_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  strain_id TEXT,
  name TEXT NOT NULL,
  type TEXT,
  quantity REAL,
  unit TEXT,
  price REAL,
  dispensary TEXT,
  purchase_date TIMESTAMP,
  expiration_date TIMESTAMP,
  notes TEXT,
  strain TEXT,
  strain_type TEXT,
  thc_percentage REAL,
  cbd_percentage REAL,
  original_quantity REAL,
  current_quantity REAL,
  quantity_unit TEXT,
  rating INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted INTEGER DEFAULT 0
);

-- Create sessions table
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  description TEXT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  method TEXT,
  thc_content REAL,
  cbd_content REAL,
  effects TEXT,
  notes TEXT,
  location TEXT,
  setting TEXT,
  activity TEXT,
  mood_before TEXT,
  mood_after TEXT,
  rating INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted INTEGER DEFAULT 0
);

-- Create session_inventory relationship table
CREATE TABLE session_inventory (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  inventory_id TEXT NOT NULL,
  quantity_used REAL,
  notes TEXT,
  unit TEXT,
  method TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (inventory_id) REFERENCES inventory_items(id)
);

-- Create indexes for better performance
CREATE INDEX idx_inventory_user_id ON inventory_items(user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_session_inventory_session_id ON session_inventory(session_id);
CREATE INDEX idx_session_inventory_inventory_id ON session_inventory(inventory_id); 