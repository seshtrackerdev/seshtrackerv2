import { D1Database } from '@cloudflare/workers-types';
import { nanoid } from 'nanoid';
import { 
  Session, 
  SessionCreate, 
  SessionProduct, 
  SessionProductCreate,
  MoodEntry,
  MoodEntryCreate,
  SessionEffect,
  SessionEffectCreate,
  SessionFilters,
  SessionSummary
} from '../../types/session';

// Define the User interface
interface User {
  id: string;
  email: string;
  name?: string;
  created: string;
  preferences: Record<string, any>;
}

/**
 * Service for managing session data in the D1 database
 */
export class SessionService {
  constructor(private db: D1Database) {}

  /**
   * Get a user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    const result = await this.db.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(userId).first();
    
    if (!result) return null;
    
    // Parse preferences JSON if it exists
    let preferences = {};
    if (result.preferences) {
      try {
        preferences = JSON.parse(result.preferences as string);
      } catch (e) {
        console.error('Error parsing user preferences:', e);
      }
    }
    
    return {
      id: result.id as string,
      email: result.email as string,
      name: result.name as string | undefined,
      created: result.created as string,
      preferences
    };
  }
  
  /**
   * Create a new user
   */
  async createUser(userData: User): Promise<User> {
    const preferencesJson = JSON.stringify(userData.preferences || {});
    
    await this.db.prepare(`
      INSERT INTO users (
        id, email, name, created, preferences
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(
      userData.id,
      userData.email,
      userData.name || null,
      userData.created,
      preferencesJson
    ).run();
    
    return userData;
  }
  
  /**
   * Update user preferences
   */
  async updateUserPreferences(userId: string, preferences: Record<string, any>): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;
    
    const updatedPreferences = {
      ...user.preferences,
      ...preferences
    };
    
    const preferencesJson = JSON.stringify(updatedPreferences);
    
    await this.db.prepare(`
      UPDATE users
      SET preferences = ?
      WHERE id = ?
    `).bind(preferencesJson, userId).run();
    
    return true;
  }

  /**
   * Create a new session
   */
  async createSession(userId: string, sessionData: SessionCreate): Promise<Session> {
    const id = nanoid();
    const now = new Date().toISOString();
    
    // Create base session
    const session: Session = {
      id,
      userId,
      title: sessionData.title,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      consumptionMethod: sessionData.consumptionMethod,
      settingLocation: sessionData.settingLocation,
      settingSocial: sessionData.settingSocial,
      settingEnvironment: sessionData.settingEnvironment,
      rating: sessionData.rating,
      notes: sessionData.notes,
      tags: sessionData.tags,
      isPublic: sessionData.isPublic ?? false,
      createdAt: now,
      updatedAt: now
    };
    
    // Convert arrays to JSON strings for storage
    const settingEnvironmentJson = session.settingEnvironment ? JSON.stringify(session.settingEnvironment) : null;
    const tagsJson = session.tags ? JSON.stringify(session.tags) : null;
    
    // Insert session into database
    await this.db.prepare(`
      INSERT INTO sessions (
        id, user_id, title, start_time, end_time, consumption_method, 
        setting_location, setting_social, setting_environment, 
        rating, notes, tags, is_public, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      userId,
      session.title,
      session.startTime,
      session.endTime,
      session.consumptionMethod,
      session.settingLocation,
      session.settingSocial,
      settingEnvironmentJson,
      session.rating,
      session.notes,
      tagsJson,
      session.isPublic ? 1 : 0,
      now,
      now
    ).run();
    
    // If products are provided, add them
    if (sessionData.products && sessionData.products.length > 0) {
      for (const product of sessionData.products) {
        await this.addProductToSession(session.id, {
          ...product,
          sessionId: session.id
        });
      }
      
      // Fetch products to include in response
      session.products = await this.getSessionProducts(session.id);
    }
    
    // If effects are provided, add them
    if (sessionData.effects && sessionData.effects.length > 0) {
      for (const effect of sessionData.effects) {
        await this.addEffectToSession(session.id, {
          ...effect,
          sessionId: session.id
        });
      }
      
      // Fetch effects to include in response
      session.effects = await this.getSessionEffects(session.id);
    }
    
    // If mood entries are provided, add them
    if (sessionData.moodEntries && sessionData.moodEntries.length > 0) {
      for (const mood of sessionData.moodEntries) {
        await this.addMoodToSession(session.id, {
          ...mood,
          sessionId: session.id
        });
      }
      
      // Fetch mood entries to include in response
      session.moodEntries = await this.getSessionMoodEntries(session.id);
    }
    
    return session;
  }
  
  /**
   * Get a session by ID
   */
  async getSession(userId: string, sessionId: string): Promise<Session | null> {
    // Fetch session
    const result = await this.db.prepare(`
      SELECT * FROM sessions WHERE id = ? AND user_id = ?
    `).bind(sessionId, userId).first();
    
    if (!result) return null;
    
    // Convert from DB row to Session type
    const session: Session = {
      id: result.id as string,
      userId: result.user_id as string,
      title: result.title as string,
      startTime: result.start_time as string,
      endTime: result.end_time as string | null,
      consumptionMethod: result.consumption_method as Session['consumptionMethod'],
      settingLocation: result.setting_location as string | undefined,
      settingSocial: result.setting_social as Session['settingSocial'] | undefined,
      isPublic: Boolean(result.is_public),
      createdAt: result.created_at as string,
      updatedAt: result.updated_at as string,
      rating: result.rating as number | undefined,
      notes: result.notes as string | undefined,
    };
    
    // Parse JSON fields
    if (result.setting_environment) {
      try {
        session.settingEnvironment = JSON.parse(result.setting_environment as string);
      } catch (e) {
        console.error('Error parsing settingEnvironment:', e);
      }
    }
    
    if (result.tags) {
      try {
        session.tags = JSON.parse(result.tags as string);
      } catch (e) {
        console.error('Error parsing tags:', e);
      }
    }
    
    // Load related data
    session.products = await this.getSessionProducts(sessionId);
    session.effects = await this.getSessionEffects(sessionId);
    session.moodEntries = await this.getSessionMoodEntries(sessionId);
    
    return session;
  }
  
  /**
   * Update a session
   */
  async updateSession(userId: string, sessionId: string, updateData: Partial<SessionCreate>): Promise<Session | null> {
    // Check if session exists and belongs to user
    const session = await this.getSession(userId, sessionId);
    if (!session) return null;
    
    const updates: Record<string, any> = {};
    const now = new Date().toISOString();
    
    // Build update object with only the fields that changed
    if (updateData.title !== undefined) updates.title = updateData.title;
    if (updateData.startTime !== undefined) updates.start_time = updateData.startTime;
    if (updateData.endTime !== undefined) updates.end_time = updateData.endTime;
    if (updateData.consumptionMethod !== undefined) updates.consumption_method = updateData.consumptionMethod;
    if (updateData.settingLocation !== undefined) updates.setting_location = updateData.settingLocation;
    if (updateData.settingSocial !== undefined) updates.setting_social = updateData.settingSocial;
    if (updateData.rating !== undefined) updates.rating = updateData.rating;
    if (updateData.notes !== undefined) updates.notes = updateData.notes;
    if (updateData.isPublic !== undefined) updates.is_public = updateData.isPublic ? 1 : 0;
    
    // Handle JSON fields
    if (updateData.settingEnvironment !== undefined) {
      updates.setting_environment = JSON.stringify(updateData.settingEnvironment);
    }
    
    if (updateData.tags !== undefined) {
      updates.tags = JSON.stringify(updateData.tags);
    }
    
    // Always update the updated_at timestamp
    updates.updated_at = now;
    
    // Only perform update if there are fields to update
    if (Object.keys(updates).length > 0) {
      // Build the SQL SET clause dynamically
      const setClauses = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      
      await this.db.prepare(`
        UPDATE sessions 
        SET ${setClauses}
        WHERE id = ? AND user_id = ?
      `).bind(...values, sessionId, userId).run();
    }
    
    // Handle relational updates if provided
    if (updateData.products) {
      // For simplicity, we'll replace all products
      // More advanced implementations might do a diff to avoid unnecessary deletions
      await this.db.prepare(`
        DELETE FROM session_products WHERE session_id = ?
      `).bind(sessionId).run();
      
      // Add new products
      for (const product of updateData.products) {
        await this.addProductToSession(sessionId, {
          ...product,
          sessionId
        });
      }
    }
    
    if (updateData.effects) {
      // Replace all effects
      await this.db.prepare(`
        DELETE FROM session_effects WHERE session_id = ?
      `).bind(sessionId).run();
      
      // Add new effects
      for (const effect of updateData.effects) {
        await this.addEffectToSession(sessionId, {
          ...effect,
          sessionId
        });
      }
    }
    
    if (updateData.moodEntries) {
      // Replace all mood entries
      await this.db.prepare(`
        DELETE FROM mood_entries WHERE session_id = ?
      `).bind(sessionId).run();
      
      // Add new mood entries
      for (const mood of updateData.moodEntries) {
        await this.addMoodToSession(sessionId, {
          ...mood,
          sessionId
        });
      }
    }
    
    // Fetch the updated session
    return this.getSession(userId, sessionId);
  }
  
  /**
   * Delete a session
   */
  async deleteSession(userId: string, sessionId: string): Promise<boolean> {
    // Check if session exists and belongs to user
    const session = await this.getSession(userId, sessionId);
    if (!session) return false;
    
    // Delete the session (cascade will handle related data)
    const result = await this.db.prepare(`
      DELETE FROM sessions WHERE id = ? AND user_id = ?
    `).bind(sessionId, userId).run();
    
    return result.meta.changes > 0;
  }
  
  /**
   * List sessions with filtering and pagination
   */
  async listSessions(userId: string, filters: SessionFilters = {}): Promise<SessionSummary[]> {
    // Start building the query
    let query = `
      SELECT 
        s.id, s.title, s.start_time, s.end_time, s.consumption_method, s.rating, s.tags,
        (SELECT COUNT(*) FROM session_products WHERE session_id = s.id) as products_count,
        (SELECT COUNT(*) FROM session_effects WHERE session_id = s.id) as effects_count
      FROM sessions s
      WHERE s.user_id = ?
    `;
    
    const queryParams: any[] = [userId];
    
    // Add filters
    if (filters.startDate) {
      query += ` AND s.start_time >= ?`;
      queryParams.push(filters.startDate);
    }
    
    if (filters.endDate) {
      query += ` AND s.start_time <= ?`;
      queryParams.push(filters.endDate);
    }
    
    if (filters.consumptionMethod && filters.consumptionMethod.length > 0) {
      const placeholders = filters.consumptionMethod.map(() => '?').join(', ');
      query += ` AND s.consumption_method IN (${placeholders})`;
      queryParams.push(...filters.consumptionMethod);
    }
    
    if (filters.minRating !== undefined) {
      query += ` AND (s.rating >= ? OR s.rating IS NULL)`;
      queryParams.push(filters.minRating);
    }
    
    if (filters.maxRating !== undefined) {
      query += ` AND (s.rating <= ? OR s.rating IS NULL)`;
      queryParams.push(filters.maxRating);
    }
    
    if (filters.search) {
      query += ` AND (s.title LIKE ? OR s.notes LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      queryParams.push(searchTerm, searchTerm);
    }
    
    // Add sorting
    const sortField = filters.sortBy || 'start_time';
    const sortDirection = filters.sortDirection || 'desc';
    query += ` ORDER BY s.${sortField} ${sortDirection}`;
    
    // Add pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    // Execute query
    const results = await this.db.prepare(query).bind(...queryParams).all();
    
    // Convert to SessionSummary objects
    return (results.results || []).map(row => {
      const summary: SessionSummary = {
        id: row.id as string,
        title: row.title as string,
        startTime: row.start_time as string,
        endTime: row.end_time as string | null,
        consumptionMethod: row.consumption_method as Session['consumptionMethod'],
        rating: row.rating as number | undefined,
        productsCount: Number(row.products_count),
        effectsCount: Number(row.effects_count),
      };
      
      // Parse tags if present
      if (row.tags) {
        try {
          summary.tags = JSON.parse(row.tags as string);
        } catch (e) {
          console.error('Error parsing tags in listSessions:', e);
        }
      }
      
      return summary;
    });
  }
  
  // Helper methods for related entities
  
  /**
   * Add a product to a session
   */
  async addProductToSession(sessionId: string, product: SessionProductCreate): Promise<SessionProduct> {
    const id = nanoid();
    const now = new Date().toISOString();
    
    // Insert product
    await this.db.prepare(`
      INSERT INTO session_products (
        id, session_id, inventory_item_id, name, type, amount, unit,
        thc_content, cbd_content, terpenes, cost_per_unit, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      sessionId,
      product.inventoryItemId || null,
      product.name,
      product.type,
      product.amount,
      product.unit,
      product.thcContent,
      product.cbdContent,
      product.terpenes ? JSON.stringify(product.terpenes) : null,
      product.costPerUnit,
      now,
      now
    ).run();
    
    // Return the created product
    return {
      id,
      sessionId,
      inventoryItemId: product.inventoryItemId,
      name: product.name,
      type: product.type,
      amount: product.amount,
      unit: product.unit,
      thcContent: product.thcContent,
      cbdContent: product.cbdContent,
      terpenes: product.terpenes,
      costPerUnit: product.costPerUnit,
      createdAt: now,
      updatedAt: now
    };
  }
  
  /**
   * Get all products for a session
   */
  async getSessionProducts(sessionId: string): Promise<SessionProduct[]> {
    const results = await this.db.prepare(`
      SELECT * FROM session_products WHERE session_id = ?
    `).bind(sessionId).all();
    
    return (results.results || []).map(row => {
      const product: SessionProduct = {
        id: row.id as string,
        sessionId: row.session_id as string,
        inventoryItemId: row.inventory_item_id as string || null,
        name: row.name as string,
        type: row.type as SessionProduct['type'],
        amount: Number(row.amount),
        unit: row.unit as string,
        thcContent: row.thc_content ? Number(row.thc_content) : undefined,
        cbdContent: row.cbd_content ? Number(row.cbd_content) : undefined,
        costPerUnit: row.cost_per_unit ? Number(row.cost_per_unit) : undefined,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string
      };
      
      // Parse terpenes if present
      if (row.terpenes) {
        try {
          product.terpenes = JSON.parse(row.terpenes as string);
        } catch (e) {
          console.error('Error parsing terpenes:', e);
        }
      }
      
      return product;
    });
  }
  
  /**
   * Add a mood entry to a session
   */
  async addMoodToSession(sessionId: string, mood: MoodEntryCreate): Promise<MoodEntry> {
    const id = nanoid();
    const now = new Date().toISOString();
    
    // Insert mood entry
    await this.db.prepare(`
      INSERT INTO mood_entries (
        id, session_id, timestamp, type, mood, intensity, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      sessionId,
      mood.timestamp,
      mood.type,
      mood.mood,
      mood.intensity,
      now,
      now
    ).run();
    
    // Return the created mood entry
    return {
      id,
      sessionId,
      timestamp: mood.timestamp,
      type: mood.type,
      mood: mood.mood,
      intensity: mood.intensity,
      createdAt: now,
      updatedAt: now
    };
  }
  
  /**
   * Get all mood entries for a session
   */
  async getSessionMoodEntries(sessionId: string): Promise<MoodEntry[]> {
    const results = await this.db.prepare(`
      SELECT * FROM mood_entries WHERE session_id = ? ORDER BY timestamp
    `).bind(sessionId).all();
    
    return (results.results || []).map(row => ({
      id: row.id as string,
      sessionId: row.session_id as string,
      timestamp: row.timestamp as string,
      type: row.type as MoodEntry['type'],
      mood: row.mood as string,
      intensity: Number(row.intensity),
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string
    }));
  }
  
  /**
   * Add an effect to a session
   */
  async addEffectToSession(sessionId: string, effect: SessionEffectCreate): Promise<SessionEffect> {
    const id = nanoid();
    const now = new Date().toISOString();
    
    // Insert effect
    await this.db.prepare(`
      INSERT INTO session_effects (
        id, session_id, name, category, intensity, onset, duration, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      sessionId,
      effect.name,
      effect.category,
      effect.intensity,
      effect.onset,
      effect.duration,
      now,
      now
    ).run();
    
    // Return the created effect
    return {
      id,
      sessionId,
      name: effect.name,
      category: effect.category,
      intensity: effect.intensity,
      onset: effect.onset,
      duration: effect.duration,
      createdAt: now,
      updatedAt: now
    };
  }
  
  /**
   * Get all effects for a session
   */
  async getSessionEffects(sessionId: string): Promise<SessionEffect[]> {
    const results = await this.db.prepare(`
      SELECT * FROM session_effects WHERE session_id = ?
    `).bind(sessionId).all();
    
    return (results.results || []).map(row => ({
      id: row.id as string,
      sessionId: row.session_id as string,
      name: row.name as string,
      category: row.category as SessionEffect['category'],
      intensity: Number(row.intensity),
      onset: row.onset ? Number(row.onset) : undefined,
      duration: row.duration ? Number(row.duration) : undefined,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string
    }));
  }
} 