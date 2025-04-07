/**
 * Inventory data models
 * These types define the structure of cannabis inventory items and consumption tracking
 */

// Main Inventory Item type
export interface InventoryItem {
  id: string;
  userId: string;
  name: string;
  type: ProductType;
  strainName?: string;
  strainType?: StrainType;
  strainDominance?: number; // -10 to 10 scale (Indica to Sativa)
  brand?: string;
  
  // Quantity tracking
  initialQuantity: number;
  currentQuantity: number;
  unit: string;
  
  // Purchase information
  purchaseDate?: string; // ISO date string
  price?: number;
  retailer?: string;
  receiptImage?: string;
  batchId?: string;
  
  // Product details
  thcContent?: number;
  cbdContent?: number;
  terpenes?: Record<string, number>;
  growMethod?: string;
  harvestDate?: string; // ISO date string
  cultivator?: string;
  
  notes?: string;
  photos?: string[];
  tags?: string[];
  isFavorite: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  
  // Relationships (populated when fetched)
  usage?: {
    sessionsUsedIn?: string[]; // Array of session IDs
    lastUsed?: string; // ISO date string
    consumptionRate?: number; // Units per week
    averageRating?: number;
    mostCommonEffects?: string[];
  };
}

// Item insertion type (without ID and timestamps)
export type InventoryItemCreate = Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'usage'>;

// Product types
export type ProductType = 
  | 'Flower' 
  | 'Pre-roll' 
  | 'Vape' 
  | 'Concentrate' 
  | 'Edible' 
  | 'Tincture' 
  | 'Topical' 
  | 'Accessory';

// Strain types
export type StrainType = 'Sativa' | 'Indica' | 'Hybrid' | 'CBD';

// Inventory consumption record
export interface InventoryConsumption {
  id: string;
  inventoryItemId: string;
  sessionId: string;
  amountUsed: number;
  remainingAmount: number;
  timestamp: string; // ISO date string
  createdAt: string; // ISO date string
}

// Consumption insertion type
export type InventoryConsumptionCreate = Omit<InventoryConsumption, 'id' | 'createdAt'>;

// Inventory summary for listings
export interface InventorySummary {
  id: string;
  name: string;
  type: ProductType;
  strainType?: StrainType;
  currentQuantity: number;
  unit: string;
  thcContent?: number;
  cbdContent?: number;
  isFavorite: boolean;
  lowStock: boolean; // Calculated field (e.g., less than 20% remaining)
}

// Inventory filters for querying
export interface InventoryFilters {
  type?: ProductType[];
  strainType?: StrainType[];
  inStock?: boolean;
  lowStock?: boolean;
  favorite?: boolean;
  tags?: string[];
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'purchaseDate' | 'currentQuantity' | 'thcContent';
  sortDirection?: 'asc' | 'desc';
}

// Strain information
export interface StrainInfo {
  name: string;
  type: StrainType;
  dominance?: number; // -10 to 10 scale (Indica to Sativa)
  genetics?: string[]; // Parent strains
  thcRange?: [number, number]; // Typical THC range
  cbdRange?: [number, number]; // Typical CBD range
  terpenes?: Record<string, number>; // Terpene profile
  effects?: string[]; // Common effects
  flavors?: string[]; // Flavor profiles
}

// Inventory update (for partial updates)
export type InventoryItemUpdate = Partial<Omit<InventoryItem, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'usage'>> & { id: string }; 