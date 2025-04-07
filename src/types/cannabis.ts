/**
 * SeshTracker Ecosystem - Cannabis Data Types
 * 
 * This file contains shared type definitions for cannabis data across the SeshTracker ecosystem:
 * - Sesh-Tracker.com (Frontend)
 * - Kush.Observer (API/Auth)
 * - My-Cannabis-Tracker.com (Admin)
 */

// Base definitions
export type StrainType = 'indica' | 'sativa' | 'hybrid';
export type Dominance = 'indica' | 'sativa' | 'balanced';
export type EffectType = 'Relaxed' | 'Creative' | 'Happy' | 'Uplifted' | 'Euphoric' | 'Sleepy' | 
  'Hungry' | 'Energetic' | 'Focused' | 'Clear-headed' | 'Alert' | 'Calm' | string;
export type MedicalUse = 'Stress' | 'Depression' | 'Pain' | 'Insomnia' | 'Anxiety' | 
  'Appetite' | 'Inflammation' | 'PTSD' | 'Epilepsy' | 'Fatigue' | 'ADHD' | string;
export type FlavorProfile = 'Earthy' | 'Sweet' | 'Citrus' | 'Berry' | 'Pine' | 
  'Woody' | 'Diesel' | 'Spicy' | 'Herbal' | 'Grape' | 'Vanilla' | 'Mango' | 'Pungent' | 'Dessert' | string;

/**
 * Cannabis strain definition
 */
export interface CannabisStrain {
  id: string;
  name: string;
  type: StrainType;
  dominance: Dominance;
  thc: number;
  cbd: number;
  terpenes?: Terpene[];
  effects: EffectType[];
  medicalUses?: MedicalUse[];
  flavors?: FlavorProfile[];
  pricePerGram?: number;
  imageUrl?: string;
  description?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Terpene profile
 */
export interface Terpene {
  name: string;
  percentage: number;
}

/**
 * Cannabis tracking session
 */
export interface TrackingSession {
  id: string;
  userId: string;
  strain: string;          // Strain name or ID reference
  strainType?: StrainType; // For quick filtering without strain lookup
  dosage: number;          // Amount consumed in grams
  dosageUnit?: 'g' | 'mg' | 'ml' | 'puff' | string; // Default is grams
  consumptionMethod?: ConsumptionMethod;
  startTime: string | Date;
  endTime?: string | Date;
  duration?: number;       // Duration in minutes
  effects?: EffectRating[];
  overallRating?: number;  // 1-10 rating
  notes?: string;
  mood?: string;
  location?: string;
  tags?: string[];
  createdAt: string | Date;
  updatedAt?: string | Date;
  // Relations
  inventoryId?: string;    // If tracked from inventory
}

/**
 * Consumption methods
 */
export type ConsumptionMethod = 
  'Smoking' | 
  'Vaporizing' | 
  'Edible' | 
  'Tincture' | 
  'Topical' | 
  'Concentrate' | 
  'Capsule' | 
  'Beverage' |
  string;

/**
 * Rating for specific effects
 */
export interface EffectRating {
  effect: EffectType;
  rating: number;         // 1-10 rating
  duration?: number;      // Duration in minutes
}

/**
 * Inventory item
 */
export interface InventoryItem {
  id: string;
  userId: string;
  strain?: CannabisStrain | string;  // Full strain object or strain ID
  strainName?: string;               // For cases where full strain data is unavailable
  type: StrainType;
  thc?: number;
  cbd?: number;
  purchaseDate: string | Date;
  expirationDate?: string | Date;
  initialQuantity: number;           // In grams
  currentQuantity: number;           // In grams
  unitPrice: number;                 // Price per gram
  totalCost: number;                 // Total purchase cost
  dispensary?: string;
  batchNumber?: string;
  imageUrl?: string;
  notes?: string;
  isActive: boolean;                 // Whether item is active in inventory
  createdAt: string | Date;
  updatedAt?: string | Date;
}

/**
 * User preferences for cannabis
 */
export interface CannabisPreferences {
  userId: string;
  favoriteStrains?: string[];        // Array of strain IDs
  preferredTypes?: StrainType[];
  preferredEffects?: EffectType[];
  avoidedEffects?: EffectType[];
  medicalConditions?: MedicalUse[];
  sensitivityLevel?: 'Low' | 'Medium' | 'High';
  dosagePreference?: number;         // Preferred dosage in grams
  consumptionFrequency?: 'Daily' | 'Weekly' | 'Monthly' | 'Rarely';
  preferredMethods?: ConsumptionMethod[];
  updatedAt?: string | Date;
}

/**
 * Analytics data structure
 */
export interface CannabisAnalytics {
  userId: string;
  period: 'day' | 'week' | 'month' | 'year' | 'all';
  startDate: string | Date;
  endDate: string | Date;
  totalSessions: number;
  totalConsumption: number;          // In grams
  averageDosage: number;             // In grams
  topStrains: Array<{
    strain: string;
    count: number;
    totalConsumption: number;
  }>;
  effectivenessMap: Record<EffectType, number>; // Average effectiveness by effect
  costAnalysis?: {
    totalSpent: number;
    averageCostPerGram: number;
    averageCostPerSession: number;
  };
  createdAt: string | Date;
}

/**
 * Admin Analytics
 */
export interface AdminAnalytics {
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  popularStrains: Array<{
    strain: string;
    sessionCount: number;
    userCount: number;
  }>;
  averageSessionDuration: number;    // In minutes
  sessionsByHour: number[];          // 24-hour distribution
  sessionsByDayOfWeek: number[];     // 7-day distribution
  totalTrackedConsumption: number;   // In grams
  generatedAt: string | Date;
}

/**
 * API Response wrapper
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
} 