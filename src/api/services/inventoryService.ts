import { D1Database } from '@cloudflare/workers-types';
import { nanoid } from 'nanoid';
import { 
  InventoryItem,
  InventoryItemCreate,
  InventoryItemUpdate,
  InventoryConsumption,
  InventoryConsumptionCreate,
  InventoryFilters,
  InventorySummary
} from '../../types/inventory';

/**
 * Service for managing inventory data in the D1 database
 */
export class InventoryService {
  constructor(private db: D1Database) {}

  /**
   * Create a new inventory item
   */
  async createInventoryItem(userId: string, itemData: InventoryItemCreate): Promise<InventoryItem> {
    const id = nanoid();
    const now = new Date().toISOString();
    
    // Create base inventory item
    const item: InventoryItem = {
      id,
      userId,
      name: itemData.name,
      type: itemData.type,
      strainName: itemData.strainName,
      strainType: itemData.strainType,
      strainDominance: itemData.strainDominance,
      brand: itemData.brand,
      
      initialQuantity: itemData.initialQuantity,
      currentQuantity: itemData.currentQuantity,
      unit: itemData.unit,
      
      purchaseDate: itemData.purchaseDate,
      price: itemData.price,
      retailer: itemData.retailer,
      receiptImage: itemData.receiptImage,
      batchId: itemData.batchId,
      
      thcContent: itemData.thcContent,
      cbdContent: itemData.cbdContent,
      terpenes: itemData.terpenes,
      growMethod: itemData.growMethod,
      harvestDate: itemData.harvestDate,
      cultivator: itemData.cultivator,
      
      notes: itemData.notes,
      photos: itemData.photos,
      tags: itemData.tags,
      isFavorite: itemData.isFavorite ?? false,
      createdAt: now,
      updatedAt: now
    };
    
    // Convert arrays to JSON strings for storage
    const terpenesJson = item.terpenes ? JSON.stringify(item.terpenes) : null;
    const photosJson = item.photos ? JSON.stringify(item.photos) : null;
    const tagsJson = item.tags ? JSON.stringify(item.tags) : null;
    
    // Insert inventory item
    await this.db.prepare(`
      INSERT INTO inventory_items (
        id, user_id, name, type, strain_name, strain_type, strain_dominance, brand,
        initial_quantity, current_quantity, unit,
        purchase_date, price, retailer, receipt_image, batch_id,
        thc_content, cbd_content, terpenes, grow_method, harvest_date, cultivator,
        notes, photos, tags, is_favorite, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      userId,
      item.name,
      item.type,
      item.strainName,
      item.strainType,
      item.strainDominance,
      item.brand,
      item.initialQuantity,
      item.currentQuantity,
      item.unit,
      item.purchaseDate,
      item.price,
      item.retailer,
      item.receiptImage,
      item.batchId,
      item.thcContent,
      item.cbdContent,
      terpenesJson,
      item.growMethod,
      item.harvestDate,
      item.cultivator,
      item.notes,
      photosJson,
      tagsJson,
      item.isFavorite ? 1 : 0,
      now,
      now
    ).run();
    
    // Initialize usage data
    item.usage = {
      sessionsUsedIn: [],
      consumptionRate: 0
    };
    
    return item;
  }
  
  /**
   * Get an inventory item by ID
   */
  async getInventoryItem(userId: string, itemId: string): Promise<InventoryItem | null> {
    // Fetch inventory item
    const result = await this.db.prepare(`
      SELECT * FROM inventory_items WHERE id = ? AND user_id = ?
    `).bind(itemId, userId).first();
    
    if (!result) return null;
    
    // Convert from DB row to InventoryItem type
    const item: InventoryItem = {
      id: result.id as string,
      userId: result.user_id as string,
      name: result.name as string,
      type: result.type as InventoryItem['type'],
      strainName: result.strain_name as string | undefined,
      strainType: result.strain_type as InventoryItem['strainType'] | undefined,
      strainDominance: result.strain_dominance as number | undefined,
      brand: result.brand as string | undefined,
      
      initialQuantity: Number(result.initial_quantity),
      currentQuantity: Number(result.current_quantity),
      unit: result.unit as string,
      
      purchaseDate: result.purchase_date as string | undefined,
      price: result.price ? Number(result.price) : undefined,
      retailer: result.retailer as string | undefined,
      receiptImage: result.receipt_image as string | undefined,
      batchId: result.batch_id as string | undefined,
      
      thcContent: result.thc_content ? Number(result.thc_content) : undefined,
      cbdContent: result.cbd_content ? Number(result.cbd_content) : undefined,
      growMethod: result.grow_method as string | undefined,
      harvestDate: result.harvest_date as string | undefined,
      cultivator: result.cultivator as string | undefined,
      
      notes: result.notes as string | undefined,
      isFavorite: Boolean(result.is_favorite),
      createdAt: result.created_at as string,
      updatedAt: result.updated_at as string,
    };
    
    // Parse JSON fields
    if (result.terpenes) {
      try {
        item.terpenes = JSON.parse(result.terpenes as string);
      } catch (e) {
        console.error('Error parsing terpenes:', e);
      }
    }
    
    if (result.photos) {
      try {
        item.photos = JSON.parse(result.photos as string);
      } catch (e) {
        console.error('Error parsing photos:', e);
      }
    }
    
    if (result.tags) {
      try {
        item.tags = JSON.parse(result.tags as string);
      } catch (e) {
        console.error('Error parsing tags:', e);
      }
    }
    
    // Load usage data
    item.usage = await this.getItemUsage(itemId);
    
    return item;
  }
  
  /**
   * Get item usage information
   */
  private async getItemUsage(itemId: string): Promise<InventoryItem['usage']> {
    // Fetch sessions this item was used in
    const sessionsResult = await this.db.prepare(`
      SELECT DISTINCT session_id 
      FROM session_products 
      WHERE inventory_item_id = ?
    `).bind(itemId).all();
    
    const sessionsUsedIn = (sessionsResult.results || []).map(row => row.session_id as string);
    
    // Get last used timestamp
    const lastUsedResult = await this.db.prepare(`
      SELECT MAX(timestamp) as last_used
      FROM inventory_consumption
      WHERE inventory_item_id = ?
    `).bind(itemId).first();
    
    const lastUsed = lastUsedResult?.last_used as string | undefined;
    
    // Calculate consumption rate (units per week)
    let consumptionRate: number | undefined;
    
    if (sessionsUsedIn.length > 0) {
      const consumptionResult = await this.db.prepare(`
        SELECT 
          SUM(amount_used) as total_used,
          MIN(timestamp) as first_use,
          MAX(timestamp) as last_use
        FROM inventory_consumption
        WHERE inventory_item_id = ?
      `).bind(itemId).first();
      
      if (consumptionResult && consumptionResult.total_used && consumptionResult.first_use && consumptionResult.last_use) {
        const totalUsed = Number(consumptionResult.total_used);
        const firstUse = new Date(consumptionResult.first_use as string);
        const lastUse = new Date(consumptionResult.last_use as string);
        
        const weeksBetween = Math.max(1, (lastUse.getTime() - firstUse.getTime()) / (7 * 24 * 60 * 60 * 1000));
        consumptionRate = totalUsed / weeksBetween;
      }
    }
    
    // Get average rating from sessions
    const ratingResult = await this.db.prepare(`
      SELECT AVG(s.rating) as avg_rating
      FROM sessions s
      JOIN session_products sp ON s.id = sp.session_id
      WHERE sp.inventory_item_id = ? AND s.rating IS NOT NULL
    `).bind(itemId).first();
    
    const averageRating = ratingResult?.avg_rating ? Number(ratingResult.avg_rating) : undefined;
    
    // Get most common effects
    const effectsResult = await this.db.prepare(`
      SELECT se.name, COUNT(*) as count
      FROM session_effects se
      JOIN session_products sp ON se.session_id = sp.session_id
      WHERE sp.inventory_item_id = ?
      GROUP BY se.name
      ORDER BY count DESC
      LIMIT 5
    `).bind(itemId).all();
    
    const mostCommonEffects = (effectsResult.results || []).map(row => row.name as string);
    
    return {
      sessionsUsedIn,
      lastUsed,
      consumptionRate,
      averageRating,
      mostCommonEffects: mostCommonEffects.length > 0 ? mostCommonEffects : undefined
    };
  }
  
  /**
   * Update an inventory item
   */
  async updateInventoryItem(userId: string, itemId: string, updateData: InventoryItemUpdate): Promise<InventoryItem | null> {
    // Check if item exists and belongs to user
    const item = await this.getInventoryItem(userId, itemId);
    if (!item) return null;
    
    const updates: Record<string, any> = {};
    const now = new Date().toISOString();
    
    // Build update object with only the fields that changed
    if (updateData.name !== undefined) updates.name = updateData.name;
    if (updateData.type !== undefined) updates.type = updateData.type;
    if (updateData.strainName !== undefined) updates.strain_name = updateData.strainName;
    if (updateData.strainType !== undefined) updates.strain_type = updateData.strainType;
    if (updateData.strainDominance !== undefined) updates.strain_dominance = updateData.strainDominance;
    if (updateData.brand !== undefined) updates.brand = updateData.brand;
    
    if (updateData.initialQuantity !== undefined) updates.initial_quantity = updateData.initialQuantity;
    if (updateData.currentQuantity !== undefined) updates.current_quantity = updateData.currentQuantity;
    if (updateData.unit !== undefined) updates.unit = updateData.unit;
    
    if (updateData.purchaseDate !== undefined) updates.purchase_date = updateData.purchaseDate;
    if (updateData.price !== undefined) updates.price = updateData.price;
    if (updateData.retailer !== undefined) updates.retailer = updateData.retailer;
    if (updateData.receiptImage !== undefined) updates.receipt_image = updateData.receiptImage;
    if (updateData.batchId !== undefined) updates.batch_id = updateData.batchId;
    
    if (updateData.thcContent !== undefined) updates.thc_content = updateData.thcContent;
    if (updateData.cbdContent !== undefined) updates.cbd_content = updateData.cbdContent;
    if (updateData.growMethod !== undefined) updates.grow_method = updateData.growMethod;
    if (updateData.harvestDate !== undefined) updates.harvest_date = updateData.harvestDate;
    if (updateData.cultivator !== undefined) updates.cultivator = updateData.cultivator;
    
    if (updateData.notes !== undefined) updates.notes = updateData.notes;
    if (updateData.isFavorite !== undefined) updates.is_favorite = updateData.isFavorite ? 1 : 0;
    
    // Handle JSON fields
    if (updateData.terpenes !== undefined) {
      updates.terpenes = updateData.terpenes ? JSON.stringify(updateData.terpenes) : null;
    }
    
    if (updateData.photos !== undefined) {
      updates.photos = updateData.photos ? JSON.stringify(updateData.photos) : null;
    }
    
    if (updateData.tags !== undefined) {
      updates.tags = updateData.tags ? JSON.stringify(updateData.tags) : null;
    }
    
    // Always update the updated_at timestamp
    updates.updated_at = now;
    
    // Only perform update if there are fields to update
    if (Object.keys(updates).length > 0) {
      // Build the SQL SET clause dynamically
      const setClauses = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      
      await this.db.prepare(`
        UPDATE inventory_items 
        SET ${setClauses}
        WHERE id = ? AND user_id = ?
      `).bind(...values, itemId, userId).run();
    }
    
    // Fetch the updated item
    return this.getInventoryItem(userId, itemId);
  }
  
  /**
   * Delete an inventory item
   */
  async deleteInventoryItem(userId: string, itemId: string): Promise<boolean> {
    // Check if item exists and belongs to user
    const item = await this.getInventoryItem(userId, itemId);
    if (!item) return false;
    
    // Delete the item
    const result = await this.db.prepare(`
      DELETE FROM inventory_items WHERE id = ? AND user_id = ?
    `).bind(itemId, userId).run();
    
    return result.meta.changes > 0;
  }
  
  /**
   * List inventory items with filtering and pagination
   */
  async listInventoryItems(userId: string, filters: InventoryFilters = {}): Promise<InventorySummary[]> {
    // Start building the query
    let query = `
      SELECT 
        id, name, type, strain_type, current_quantity, initial_quantity, unit,
        thc_content, cbd_content, is_favorite
      FROM inventory_items
      WHERE user_id = ?
    `;
    
    const queryParams: any[] = [userId];
    
    // Add filters
    if (filters.type && filters.type.length > 0) {
      const placeholders = filters.type.map(() => '?').join(', ');
      query += ` AND type IN (${placeholders})`;
      queryParams.push(...filters.type);
    }
    
    if (filters.strainType && filters.strainType.length > 0) {
      const placeholders = filters.strainType.map(() => '?').join(', ');
      query += ` AND strain_type IN (${placeholders})`;
      queryParams.push(...filters.strainType);
    }
    
    if (filters.inStock) {
      query += ` AND current_quantity > 0`;
    }
    
    if (filters.lowStock) {
      query += ` AND current_quantity > 0 AND current_quantity <= (initial_quantity * 0.2)`;
    }
    
    if (filters.favorite) {
      query += ` AND is_favorite = 1`;
    }
    
    if (filters.search) {
      query += ` AND (name LIKE ? OR strain_name LIKE ? OR brand LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Add sorting
    const sortField = filters.sortBy || 'name';
    const sortDirection = filters.sortDirection || 'asc';
    
    // Map camelCase fields to snake_case for SQL
    const sortFieldMap: Record<string, string> = {
      'name': 'name',
      'purchaseDate': 'purchase_date',
      'currentQuantity': 'current_quantity',
      'thcContent': 'thc_content'
    };
    
    const sqlSortField = sortFieldMap[sortField] || 'name';
    query += ` ORDER BY ${sqlSortField} ${sortDirection}`;
    
    // Add pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    // Execute query
    const results = await this.db.prepare(query).bind(...queryParams).all();
    
    // Convert to InventorySummary objects
    return (results.results || []).map(row => {
      const initialQuantity = Number(row.initial_quantity);
      const currentQuantity = Number(row.current_quantity);
      
      return {
        id: row.id as string,
        name: row.name as string,
        type: row.type as InventoryItem['type'],
        strainType: row.strain_type as InventoryItem['strainType'] | undefined,
        currentQuantity,
        unit: row.unit as string,
        thcContent: row.thc_content ? Number(row.thc_content) : undefined,
        cbdContent: row.cbd_content ? Number(row.cbd_content) : undefined,
        isFavorite: Boolean(row.is_favorite),
        lowStock: currentQuantity > 0 && currentQuantity <= (initialQuantity * 0.2)
      };
    });
  }
  
  /**
   * Record consumption of an inventory item in a session
   */
  async consumeInventory(userId: string, data: InventoryConsumptionCreate): Promise<InventoryConsumption | null> {
    // Check if item exists and belongs to user
    const item = await this.getInventoryItem(userId, data.inventoryItemId);
    if (!item) return null;
    
    // Calculate new quantity
    const newQuantity = Math.max(0, item.currentQuantity - data.amountUsed);
    
    // Create consumption record
    const id = nanoid();
    const now = new Date().toISOString();
    
    const consumption: InventoryConsumption = {
      id,
      inventoryItemId: data.inventoryItemId,
      sessionId: data.sessionId,
      amountUsed: data.amountUsed,
      remainingAmount: newQuantity,
      timestamp: data.timestamp || now,
      createdAt: now
    };
    
    // First update the inventory item current quantity
    await this.updateInventoryItem(userId, data.inventoryItemId, {
      id: data.inventoryItemId,
      currentQuantity: newQuantity
    });
    
    // Then record the consumption
    await this.db.prepare(`
      INSERT INTO inventory_consumption (
        id, inventory_item_id, session_id, amount_used, remaining_amount, timestamp, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      consumption.inventoryItemId,
      consumption.sessionId,
      consumption.amountUsed,
      consumption.remainingAmount,
      consumption.timestamp,
      consumption.createdAt
    ).run();
    
    return consumption;
  }
  
  /**
   * Get consumption history for an inventory item
   */
  async getItemConsumptionHistory(userId: string, itemId: string): Promise<InventoryConsumption[]> {
    // Check if item exists and belongs to user
    const item = await this.getInventoryItem(userId, itemId);
    if (!item) return [];
    
    // Fetch consumption records
    const results = await this.db.prepare(`
      SELECT c.*
      FROM inventory_consumption c
      JOIN inventory_items i ON c.inventory_item_id = i.id
      WHERE i.id = ? AND i.user_id = ?
      ORDER BY c.timestamp DESC
    `).bind(itemId, userId).all();
    
    // Convert to InventoryConsumption objects
    return (results.results || []).map(row => ({
      id: row.id as string,
      inventoryItemId: row.inventory_item_id as string,
      sessionId: row.session_id as string,
      amountUsed: Number(row.amount_used),
      remainingAmount: Number(row.remaining_amount),
      timestamp: row.timestamp as string,
      createdAt: row.created_at as string
    }));
  }
} 