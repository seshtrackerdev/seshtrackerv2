/**
 * Components Master Export File
 * 
 * This file centralizes all component exports to simplify imports throughout the application.
 * Instead of importing from specific component files, you can import from this file:
 * 
 * import { Dashboard, InventoryPage, Header } from '../components';
 */

// Re-export components by category
export * from './dashboard';
export * from './inventory';
export * from './sessions';
export * from './common';
export * from './layouts';
export * from './auth';
export * from './profile';
export * from './test';
export * from './landing';

// Special case for UI components (keeping the original imports)
export * from './ui'; 