/**
 * Session data models
 * These types define the structure of cannabis consumption sessions and related data
 */

// Main Session type
export interface Session {
  id: string;
  userId: string;
  title: string;
  startTime: string; // ISO date string
  endTime: string | null; // ISO date string or null if ongoing
  consumptionMethod: ConsumptionMethod;
  settingLocation?: string;
  settingSocial?: SocialSetting;
  settingEnvironment?: string[]; // Tags like "Relaxed", "Loud", "Nature", etc.
  rating?: number; // 1-10
  notes?: string;
  tags?: string[];
  isPublic: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  
  // Relationships (populated when fetched)
  products?: SessionProduct[];
  effects?: SessionEffect[];
  moodEntries?: MoodEntry[];
}

// Session insertion type (without ID and timestamps)
export type SessionCreate = Omit<Session, 'id' | 'createdAt' | 'updatedAt'>;

// Consumption methods
export type ConsumptionMethod = 
  | 'Flower' 
  | 'Vape' 
  | 'Concentrate' 
  | 'Edible' 
  | 'Tincture' 
  | 'Topical' 
  | 'Other';

// Social settings
export type SocialSetting = 'Alone' | 'Small Group' | 'Party' | 'Other';

// Products used in a session
export interface SessionProduct {
  id: string;
  sessionId: string;
  inventoryItemId?: string | null; // Can be null for products not in inventory
  name: string;
  type: ProductType;
  amount: number;
  unit: string;
  thcContent?: number;
  cbdContent?: number;
  terpenes?: Record<string, number>;
  costPerUnit?: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductType = 'Strain' | 'Concentrate' | 'Edible' | 'Other';

// Product insertion type
export type SessionProductCreate = Omit<SessionProduct, 'id' | 'createdAt' | 'updatedAt'>;

// Mood entries during a session
export interface MoodEntry {
  id: string;
  sessionId: string;
  timestamp: string; // ISO date string
  type: MoodEntryType;
  mood: string;
  intensity: number; // 1-10
  createdAt: string;
  updatedAt: string;
}

export type MoodEntryType = 'before' | 'during' | 'after';

// Mood entry insertion type
export type MoodEntryCreate = Omit<MoodEntry, 'id' | 'createdAt' | 'updatedAt'>;

// Effects experienced during a session
export interface SessionEffect {
  id: string;
  sessionId: string;
  name: string;
  category: EffectCategory;
  intensity: number; // 1-10
  onset?: number; // Minutes after start
  duration?: number; // Minutes
  createdAt: string;
  updatedAt: string;
}

export type EffectCategory = 'positive' | 'negative' | 'medical';

// Effect insertion type
export type SessionEffectCreate = Omit<SessionEffect, 'id' | 'createdAt' | 'updatedAt'>;

// Session summary for listing views
export interface SessionSummary {
  id: string;
  title: string;
  startTime: string;
  endTime: string | null;
  consumptionMethod: ConsumptionMethod;
  rating?: number;
  productsCount: number;
  effectsCount: number;
  tags?: string[];
}

// Session filters for querying
export interface SessionFilters {
  startDate?: string;
  endDate?: string;
  consumptionMethod?: ConsumptionMethod[];
  productType?: ProductType[];
  effects?: string[];
  tags?: string[];
  minRating?: number;
  maxRating?: number;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'startTime' | 'rating' | 'duration';
  sortDirection?: 'asc' | 'desc';
} 