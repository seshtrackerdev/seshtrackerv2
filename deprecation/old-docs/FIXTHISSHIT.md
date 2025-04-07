
```
# SESHTRACKER MIGRATION PLAN

## 1. Database Setup
npx wrangler d1 create seshtracker-main-db

## 2. Update wrangler.json
{
  "name": "seshtracker",
  "main": "src/index.ts",
  "compatibility_date": "2024-04-01",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "seshtracker-main-db",
      "database_id": "REPLACE_WITH_YOUR_DB_ID"
    }
  ],
  "vars": {
    "AUTH_API_URL": "https://kushobserver.tmultidev.workers.dev"
  }
}

## 3. Create Database Schema (migrations/schema.sql)
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

## 4. Apply the schema
npx wrangler d1 execute seshtracker-main-db --file=./migrations/schema.sql
npx wrangler d1 execute seshtracker-main-db --file=./migrations/schema.sql --remote

## 5. Auth Middleware (src/middleware/auth.ts)
import { Context } from 'hono';
import { env } from 'hono/adapter';

export async function verifyAuthToken(c: Context): Promise<string | null> {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return null;
    }
    
    // Verify token with Kush.observer
    const authApiUrl = env(c).AUTH_API_URL;
    const validationResponse = await fetch(`${authApiUrl}/api/auth/validate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    
    if (!validationResponse.ok) {
      return null;
    }
    
    const validationData = await validationResponse.json();
    if (!validationData.success || !validationData.userId) {
      return null;
    }
    
    // Set user ID in context
    c.set('userId', validationData.userId);
    return validationData.userId;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function withUserContext(c: Context, next: () => Promise<void>): Promise<Response | void> {
  const userId = verifyAuthToken(c);
  if (!userId) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  return next();
}

## 6. Add Token Validation Endpoint to Kush.observer (src/routes/auth.ts)
// --- API: Validate Token ---
authRouter.post('/validate-token', async (c) => {
  try {
    const { token } = await c.req.json<{ token?: string }>();
    const secret = getJwtSecret(c);

    if (!token) {
      return c.json({ success: false, error: 'Token is required' }, 400);
    }

    // Verify the token
    try {
      const payload = await verify(token, secret);
      if (!payload || !payload.sub) {
        return c.json({ success: false, error: 'Invalid token' }, 401);
      }

      // Get the user ID from the payload
      const userId = payload.sub;

      // Check if user still exists and is active
      const { AUTH_DB } = env(c);
      const userQuery = AUTH_DB.prepare('SELECT id, account_status FROM users WHERE id = ?');
      const user = await userQuery.bind(userId).first<{ id: string; account_status: string | null }>();

      if (!user) {
        return c.json({ success: false, error: 'User not found' }, 404);
      }

      if (user.account_status && user.account_status !== 'active') {
        return c.json({ success: false, error: 'Account is not active' }, 403);
      }

      // Return success with userId
      return c.json({ 
        success: true,
        userId: userId,
        message: 'Token is valid'
      });
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return c.json({ success: false, error: 'Invalid token' }, 401);
    }
  } catch (error) {
    console.error('Token validation error:', error);
    return c.json({ success: false, error: 'Failed to validate token' }, 500);
  }
});

## 7. SeshTracker Inventory Routes (src/routes/inventory.ts)
import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { verifyAuthToken, withUserContext } from '../middleware/auth';
import type { InventoryItem, CreateInventoryItemRequest, UpdateInventoryItemRequest } from '../types';

type Env = {
  DB: D1Database;
  AUTH_API_URL: string;
};

const inventoryRouter = new Hono<{ Variables: { userId: string }, Bindings: Env }>();

// Apply auth middleware
inventoryRouter.use('*', withUserContext);

// Get inventory items
inventoryRouter.get('/', async (c) => {
  try {
    const { DB } = env<Env>(c);
    const userId = c.get('userId');
    
    // Parse query parameters
    const { page = '1', limit = '20', sort = 'purchase_date', order = 'desc' } = c.req.query();
    
    // Validate and convert parameters
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    const offset = (pageNum - 1) * limitNum;
    
    // Build query
    let query = 'SELECT * FROM inventory_items WHERE user_id = ? AND is_deleted = 0';
    const params: any[] = [userId];
    
    // Add sorting
    const validSortColumns = ['id', 'name', 'type', 'strain_id', 'quantity', 'price', 'purchase_date', 'created_at'];
    const validOrders = ['asc', 'desc'];
    
    const safeSort = validSortColumns.includes(sort) ? sort : 'purchase_date';
    const safeOrder = validOrders.includes(order.toLowerCase()) ? order.toLowerCase() : 'desc';
    
    query += ` ORDER BY ${safeSort} ${safeOrder}`;
    
    // Get total count
    const countResult = await DB.prepare('SELECT COUNT(*) as total FROM inventory_items WHERE user_id = ? AND is_deleted = 0')
      .bind(userId)
      .first();
    const total = countResult ? (countResult.total as number) : 0;
    
    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(limitNum.toString(), offset.toString());
    
    // Execute query
    const items = await DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      inventory: items.results || [],
      pagination: {
        limit: limitNum,
        offset,
        total,
        hasMore: offset + limitNum < total
      }
    });
  } catch (error) {
    console.error('Failed to get inventory items:', error);
    return c.json({ success: false, error: 'Failed to get inventory items' }, 500);
  }
});

// Create inventory item
inventoryRouter.post('/', async (c) => {
  try {
    const { DB } = env<Env>(c);
    const userId = c.get('userId');
    const data = await c.req.json<CreateInventoryItemRequest>();
    
    // Validate required fields
    if (!data.name) {
      return c.json({ success: false, error: 'Name is required' }, 400);
    }
    
    // Generate a unique ID for the item
    const itemId = crypto.randomUUID();
    
    // Insert the inventory item
    await DB.prepare(`
      INSERT INTO inventory_items (
        id, user_id, name, strain_id, quantity, price, purchase_date, 
        created_at, updated_at, is_deleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)
    `).bind(
      itemId,
      userId,
      data.name,
      data.strain_id || null,
      data.quantity || null,
      data.price || null,
      data.purchase_date || null
    ).run();
    
    // Return the created item
    return c.json({
      success: true,
      item: {
        id: itemId,
        user_id: userId,
        name: data.name,
        strain_id: data.strain_id || null,
        quantity: data.quantity || null,
        price: data.price || null,
        purchase_date: data.purchase_date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: 0
      }
    }, 201);
  } catch (error) {
    console.error('Failed to create inventory item:', error);
    return c.json({ success: false, error: 'Failed to create inventory item' }, 500);
  }
});

export default inventoryRouter;

## 8. Main API Router (src/index.ts)
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import inventoryRouter from './routes/inventory';
import sessionsRouter from './routes/sessions';

type Env = {
  DB: D1Database;
  AUTH_API_URL: string;
};

type Variables = {
  userId: string;
};

const app = new Hono<{ Variables: Variables, Bindings: Env }>();

// Add CORS middleware
app.use('*', cors({
  origin: ['https://sesh-tracker.com', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 600
}));

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    message: 'SeshTracker API is running',
    version: '1.0.0'
  });
});

// Mount API routes
app.route('/api/inventory', inventoryRouter);
app.route('/api/sessions', sessionsRouter);

// Default route
app.get('*', (c) => {
  return c.json({
    message: 'SeshTracker API - Use /api/inventory or /api/sessions',
    docs: 'https://docs.sesh-tracker.com'
  });
});

export default app;

## 9. Data Migration Script (scripts/migrate-data.js)
// Script to migrate existing data from kushobserver to seshtracker
const fetch = require('node-fetch');

// Configuration
const KUSH_API_URL = 'https://kushobserver.tmultidev.workers.dev';
const SESH_API_URL = 'https://seshtracker.workers.dev';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

async function migrate() {
  try {
    console.log('Starting data migration...');
    
    // Step 1: Login to Kush.observer
    console.log('Authenticating with Kush.observer...');
    const loginResponse = await fetch(`${KUSH_API_URL}/api/auth/direct-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Authentication failed: ${await loginResponse.text()}`);
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log(`Authenticated as ${loginData.user.email}`);
    
    // Step 2: Fetch all inventory items from Kush.observer
    console.log('Fetching inventory items from Kush.observer...');
    const inventoryResponse = await fetch(`${KUSH_API_URL}/api/inventory`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!inventoryResponse.ok) {
      throw new Error(`Failed to fetch inventory: ${await inventoryResponse.text()}`);
    }
    
    const inventoryData = await inventoryResponse.json();
    const inventoryItems = inventoryData.inventory || [];
    console.log(`Found ${inventoryItems.length} inventory items`);
    
    // Step 3: Fetch all sessions from Kush.observer
    console.log('Fetching sessions from Kush.observer...');
    const sessionsResponse = await fetch(`${KUSH_API_URL}/api/sessions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!sessionsResponse.ok) {
      throw new Error(`Failed to fetch sessions: ${await sessionsResponse.text()}`);
    }
    
    const sessionsData = await sessionsResponse.json();
    const sessions = sessionsData.sessions || [];
    console.log(`Found ${sessions.length} sessions`);
    
    // Step 4: Migrate inventory items to SeshTracker
    console.log('Migrating inventory items to SeshTracker...');
    for (const item of inventoryItems) {
      const createResponse = await fetch(`${SESH_API_URL}/api/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
      });
      
      if (!createResponse.ok) {
        console.error(`Failed to migrate item ${item.id}: ${await createResponse.text()}`);
        continue;
      }
      
      console.log(`Migrated inventory item: ${item.name} (${item.id})`);
    }
    
    // Step 5: Migrate sessions to SeshTracker
    console.log('Migrating sessions to SeshTracker...');
    for (const session of sessions) {
      const createResponse = await fetch(`${SESH_API_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(session)
      });
      
      if (!createResponse.ok) {
        console.error(`Failed to migrate session ${session.id}: ${await createResponse.text()}`);
        continue;
      }
      
      console.log(`Migrated session: ${session.title} (${session.id})`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();

## 10. Deployment Process
# Deploy Kush.observer changes (token validation endpoint)
cd /path/to/kushobserver
npx wrangler deploy

# Deploy SeshTracker with new DB configuration
cd /path/to/seshtracker
npx wrangler deploy

# Run migration script to transfer data
node scripts/migrate-data.js
```
