import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { verifyAuthToken, withUserContext } from '../middleware/auth';

interface Session {
  id: string;
  user_id: string;
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  method?: string;
  thc_content?: number;
  cbd_content?: number;
  effects?: string;
  notes?: string;
  location?: string;
  setting?: string;
  activity?: string;
  mood_before?: string;
  mood_after?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
  is_deleted: number;
}

interface CreateSessionRequest {
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  method?: string;
  thc_content?: number;
  cbd_content?: number;
  effects?: string;
  notes?: string;
  location?: string;
  setting?: string;
  activity?: string;
  mood_before?: string;
  mood_after?: string;
  rating?: number;
  inventory_items?: SessionInventoryItem[];
}

interface SessionInventoryItem {
  inventory_id: string;
  quantity_used?: number;
  notes?: string;
  unit?: string;
  method?: string;
}

interface UpdateSessionRequest extends Partial<CreateSessionRequest> {
  id: string;
}

type Bindings = {
  DB: D1Database;
  AUTH_API_URL: string;
};

type Variables = {
  userId: string;
};

const sessionsRouter = new Hono<{ Variables: Variables, Bindings: Bindings }>();

// Apply auth middleware
sessionsRouter.use('*', withUserContext);

// Get sessions
sessionsRouter.get('/', async (c) => {
  try {
    const { DB } = env<Bindings>(c);
    const userId = c.get('userId');
    
    // Parse query parameters
    const { page = '1', limit = '20', sort = 'start_time', order = 'desc' } = c.req.query();
    
    // Validate and convert parameters
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    const offset = (pageNum - 1) * limitNum;
    
    // Build query
    let query = 'SELECT * FROM sessions WHERE user_id = ? AND is_deleted = 0';
    const params: any[] = [userId];
    
    // Add sorting
    const validSortColumns = ['id', 'title', 'start_time', 'end_time', 'rating', 'created_at'];
    const validOrders = ['asc', 'desc'];
    
    const safeSort = validSortColumns.includes(sort) ? sort : 'start_time';
    const safeOrder = validOrders.includes(order.toLowerCase()) ? order.toLowerCase() : 'desc';
    
    query += ` ORDER BY ${safeSort} ${safeOrder}`;
    
    // Get total count
    const countResult = await DB.prepare('SELECT COUNT(*) as total FROM sessions WHERE user_id = ? AND is_deleted = 0')
      .bind(userId)
      .first<{ total: number }>();
    const total = countResult ? countResult.total : 0;
    
    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);
    
    // Execute query
    const sessions = await DB.prepare(query).bind(...params).all<Session>();
    
    return c.json({
      success: true,
      sessions: sessions.results || [],
      pagination: {
        limit: limitNum,
        offset,
        total,
        hasMore: offset + limitNum < total
      }
    });
  } catch (error) {
    console.error('Failed to get sessions:', error);
    return c.json({ success: false, error: 'Failed to get sessions' }, 500);
  }
});

// Create session
sessionsRouter.post('/', async (c) => {
  try {
    const { DB } = env<Bindings>(c);
    const userId = c.get('userId');
    const data = await c.req.json<CreateSessionRequest>();
    
    // Generate a unique ID for the session
    const sessionId = crypto.randomUUID();
    
    // Start a transaction
    const db = DB;
    
    // Insert the session
    await db.prepare(`
      INSERT INTO sessions (
        id, user_id, title, description, start_time, end_time, method,
        thc_content, cbd_content, effects, notes, location, setting,
        activity, mood_before, mood_after, rating,
        created_at, updated_at, is_deleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)
    `).bind(
      sessionId,
      userId,
      data.title || null,
      data.description || null,
      data.start_time || null,
      data.end_time || null,
      data.method || null,
      data.thc_content || null,
      data.cbd_content || null,
      data.effects || null,
      data.notes || null,
      data.location || null,
      data.setting || null,
      data.activity || null,
      data.mood_before || null,
      data.mood_after || null,
      data.rating || null
    ).run();
    
    // Add inventory items to the session if provided
    if (data.inventory_items && data.inventory_items.length > 0) {
      for (const item of data.inventory_items) {
        const inventoryItemId = item.inventory_id;
        
        // Check if inventory item exists and belongs to user
        const inventoryCheck = await db.prepare(
          'SELECT id FROM inventory_items WHERE id = ? AND user_id = ? AND is_deleted = 0'
        ).bind(inventoryItemId, userId).first<{ id: string }>();
        
        if (!inventoryCheck) {
          console.warn(`Inventory item ${inventoryItemId} not found or does not belong to user ${userId}`);
          continue;
        }
        
        // Add inventory item to session
        const sessionInventoryId = crypto.randomUUID();
        await db.prepare(`
          INSERT INTO session_inventory (
            id, session_id, inventory_id, quantity_used, notes, unit, method,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).bind(
          sessionInventoryId,
          sessionId,
          inventoryItemId,
          item.quantity_used || null,
          item.notes || null,
          item.unit || null,
          item.method || null
        ).run();
      }
    }
    
    // Return the created session
    return c.json({
      success: true,
      session: {
        id: sessionId,
        user_id: userId,
        title: data.title || null,
        description: data.description || null,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        method: data.method || null,
        thc_content: data.thc_content || null,
        cbd_content: data.cbd_content || null,
        effects: data.effects || null,
        notes: data.notes || null,
        location: data.location || null,
        setting: data.setting || null,
        activity: data.activity || null,
        mood_before: data.mood_before || null,
        mood_after: data.mood_after || null,
        rating: data.rating || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: 0
      }
    }, 201);
  } catch (error) {
    console.error('Failed to create session:', error);
    return c.json({ success: false, error: 'Failed to create session' }, 500);
  }
});

export default sessionsRouter; 