/**
 * Types Index - Re-export all type definitions
 * 
 * This file provides a central place to import all types to avoid duplication
 * and handle conflicts between different type definition files.
 */

// Primary export from cannabis.ts (preferred definitions)
export * from './cannabis';

// Legacy types from inventory.ts and session.ts
// Only export non-conflicting types or explicitly rename conflicting ones
export type {
  // From inventory.ts
  ProductType as LegacyProductType,
  InventoryItemCreate,
  InventoryConsumption,
  InventoryConsumptionCreate,
  InventorySummary,
  InventoryFilters,
  StrainInfo as LegacyStrainInfo,
  InventoryItemUpdate,
} from './inventory';

export type {
  // From session.ts
  Session as LegacySession,
  SessionCreate,
  SocialSetting,
  SessionProduct,
  // Rename conflicting types
  ProductType as SessionProductType,
  ConsumptionMethod as LegacyConsumptionMethod,
  // Non-conflicting types
  SessionProductCreate,
  MoodEntry,
  MoodEntryType,
  MoodEntryCreate,
  SessionEffect,
  EffectCategory,
  SessionEffectCreate,
  SessionSummary,
  SessionFilters,
} from './session';

// Note: Types like StrainType, InventoryItem, and ConsumptionMethod should
// now be imported from cannabis.ts, which has the more complete definitions. 