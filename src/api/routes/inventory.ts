import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { verifyAuthToken, withUserContext } from '../middleware/auth';

interface InventoryItem {
  id: string;
  user_id: string;
  strain_id?: string;
  name: string;
  type?: string;
  quantity?: number;
  unit?: string;
  price?: number;
  dispensary?: string;
  purchase_date?: string;
  expiration_date?: string;
  notes?: string;
  strain?: string;
  strain_type?: string;
  thc_percentage?: number;
  cbd_percentage?: number;
  original_quantity?: number;
  current_quantity?: number;
  quantity_unit?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
  is_deleted: number;
}

interface CreateInventoryItemRequest {
  name: string;
  strain_id?: string;
  type?: string;
  quantity?: number;
  unit?: string;
  price?: number;
  dispensary?: string;
  purchase_date?: string;
  expiration_date?: string;
  notes?: string;
  strain?: string;
  strain_type?: string;
  thc_percentage?: number;
  cbd_percentage?: number;
  original_quantity?: number;
  current_quantity?: number;
  quantity_unit?: string;
  rating?: number;
}

interface UpdateInventoryItemRequest extends Partial<CreateInventoryItemRequest> {
  id: string;
}

type Bindings = {
  DB: D1Database;
  AUTH_API_URL: string;
};

type Variables = {
  userId: string;
};

const inventoryRouter = new Hono<{ Variables: Variables, Bindings: Bindings }>();

// Apply auth middleware
inventoryRouter.use('*', withUserContext);

// Get inventory items
inventoryRouter.get('/', async (c) => {
  try {
    const { DB } = env<Bindings>(c);
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
      .first<{ total: number }>();
    const total = countResult ? countResult.total : 0;
    
    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);
    
    // Execute query
    const items = await DB.prepare(query).bind(...params).all<InventoryItem>();
    
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
    const { DB } = env<Bindings>(c);
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
        id, user_id, name, strain_id, type, quantity, unit, price, dispensary,
        purchase_date, expiration_date, notes, strain, strain_type,
        thc_percentage, cbd_percentage, original_quantity, current_quantity,
        quantity_unit, rating, created_at, updated_at, is_deleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)
    `).bind(
      itemId,
      userId,
      data.name,
      data.strain_id || null,
      data.type || null,
      data.quantity || null,
      data.unit || null,
      data.price || null,
      data.dispensary || null,
      data.purchase_date || null,
      data.expiration_date || null,
      data.notes || null,
      data.strain || null,
      data.strain_type || null,
      data.thc_percentage || null,
      data.cbd_percentage || null,
      data.original_quantity || null,
      data.current_quantity || null,
      data.quantity_unit || null,
      data.rating || null
    ).run();
    
    // Return the created item
    return c.json({
      success: true,
      item: {
        id: itemId,
        user_id: userId,
        name: data.name,
        strain_id: data.strain_id || null,
        type: data.type || null,
        quantity: data.quantity || null,
        unit: data.unit || null,
        price: data.price || null,
        dispensary: data.dispensary || null,
        purchase_date: data.purchase_date || null,
        expiration_date: data.expiration_date || null,
        notes: data.notes || null,
        strain: data.strain || null,
        strain_type: data.strain_type || null,
        thc_percentage: data.thc_percentage || null,
        cbd_percentage: data.cbd_percentage || null,
        original_quantity: data.original_quantity || null,
        current_quantity: data.current_quantity || null,
        quantity_unit: data.quantity_unit || null,
        rating: data.rating || null,
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