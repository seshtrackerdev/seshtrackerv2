import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useAuth } from '../hooks';
import { 
  InventoryItem, 
  InventoryItemCreate, 
  InventorySummary, 
  InventoryConsumption,
  InventoryFilters,
  ProductType,
  StrainType
} from '../../types/inventory';

// Define the inventory usage type based on the nested property in InventoryItem
type InventoryItemUsage = NonNullable<InventoryItem['usage']>;

// Define the context type
interface InventoryContextType {
  // Inventory data
  inventoryItems: InventorySummary[];
  currentItem: InventoryItem | null;
  itemUsage: InventoryItemUsage | null;
  consumptionHistory: InventoryConsumption[];
  isLoading: boolean;
  error: string | null;
  filters: InventoryFilters;
  
  // Inventory actions
  loadInventory: (filters?: InventoryFilters) => Promise<void>;
  loadInventoryItem: (itemId: string) => Promise<InventoryItem | null>;
  loadItemUsage: (itemId: string) => Promise<InventoryItemUsage | null>;
  loadConsumptionHistory: (itemId: string) => Promise<InventoryConsumption[]>;
  createInventoryItem: (itemData: InventoryItemCreate) => Promise<InventoryItem | null>;
  updateInventoryItem: (itemId: string, itemData: Partial<InventoryItemCreate>) => Promise<InventoryItem | null>;
  deleteInventoryItem: (itemId: string) => Promise<boolean>;
  
  // Filter management
  setFilter: <K extends keyof InventoryFilters>(key: K, value: InventoryFilters[K]) => void;
  clearFilters: () => void;
}

// Create the context with a default value
const InventoryContext = createContext<InventoryContextType | null>(null);

// Provider component
export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { fetchProtected, isAuthenticated } = useAuth();
  const [inventoryItems, setInventoryItems] = useState<InventorySummary[]>([]);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [itemUsage, setItemUsage] = useState<InventoryItemUsage | null>(null);
  const [consumptionHistory, setConsumptionHistory] = useState<InventoryConsumption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InventoryFilters>({
    limit: 20,
    offset: 0,
    sortBy: 'purchaseDate',
    sortDirection: 'desc'
  });
  
  // Use a ref to track loading state across renders and prevent multiple API calls
  const loadingRef = useRef(false);
  
  // TEMPORARY DEBUG FUNCTION - REMOVE IN PRODUCTION
  const fetchInventoryDebug = async (): Promise<InventorySummary[]> => {
    try {
      console.log('[DEBUG] Fetching inventory from debug endpoint');
      const response = await fetch('/api/debug/inventory');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch inventory from debug endpoint: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[DEBUG] Debug inventory response:', data);
      
      // Convert debug items to InventorySummary objects
      return (data.inventory || []).map((item: any) => ({
        ...item,
        lowStock: item.quantity < 5, // Add low stock flag
        totalSessions: 0,
        lastUsed: null
      }));
    } catch (error) {
      console.error('Error fetching inventory from debug endpoint:', error);
      throw error;
    }
  };
  
  // Load inventory based on filters
  const fetchInventory = async (filters: InventoryFilters = {}): Promise<InventorySummary[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query params
      const queryParams = new URLSearchParams();
      
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.offset) queryParams.append('offset', filters.offset.toString());
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortDirection) queryParams.append('sortDirection', filters.sortDirection);
      if (filters.types && filters.types.length > 0) queryParams.append('types', filters.types.join(','));
      if (filters.search) queryParams.append('search', filters.search);
      
      console.log('Fetching inventory with params:', Object.fromEntries(queryParams.entries()));
      
      const response = await fetchProtected(`/api/protected/inventory?${queryParams.toString()}`);
      
      if (!response.ok) {
        // If the real API fails, fallback to debug endpoint
        console.log('Protected endpoint failed, falling back to debug endpoint');
        const debugInventory = await fetchInventoryDebug();
        setInventoryItems(debugInventory);
        return debugInventory;
      }
      
      const data = await response.json();
      console.log('Inventory response:', data);
      
      if (!data.success && !data.items) {
        throw new Error(data.error || 'Failed to fetch inventory');
      }
      
      // Convert items to InventorySummary objects with proper field mapping
      const inventoryItems = (data.items || []).map((item: any) => ({
        ...item,
        // Make sure all required fields exist
        lowStock: item.lowStock !== undefined ? item.lowStock : (item.quantity < 5),
        totalSessions: item.totalSessions || 0,
        lastUsed: item.lastUsed || null
      }));
      
      setInventoryItems(inventoryItems);
      return inventoryItems;
    } catch (error) {
      console.error('Error loading inventory:', error);
      setError(error instanceof Error ? error.message : 'Failed to load inventory');
      
      // Fallback to debug data
      const debugInventory = await fetchInventoryDebug();
      setInventoryItems(debugInventory);
      return debugInventory;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load inventory based on filters
  const loadInventory = async (newFilters?: InventoryFilters): Promise<void> => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    // Update filters if provided
    const appliedFilters = newFilters ? { ...filters, ...newFilters } : filters;
    
    // IMPORTANT: Don't update filters state here as it will cause re-renders and potential infinite loops
    // We only update filters through setFilter or clearFilters functions
    
    try {
      // TEMPORARY: Use debug endpoint instead of real API
      const inventory = await fetchInventory(appliedFilters);
      setInventoryItems(inventory);
      
      /* COMMENT OUT ORIGINAL CODE FOR NOW
      const queryParams = new URLSearchParams();
      
      if (appliedFilters.type) {
        queryParams.set('type', appliedFilters.type.join(','));
      }
      if (appliedFilters.strainType) {
        queryParams.set('strainType', appliedFilters.strainType.join(','));
      }
      if (appliedFilters.inStock !== undefined) queryParams.set('inStock', appliedFilters.inStock.toString());
      if (appliedFilters.lowStock !== undefined) queryParams.set('lowStock', appliedFilters.lowStock.toString());
      if (appliedFilters.favorite !== undefined) queryParams.set('favorite', appliedFilters.favorite.toString());
      if (appliedFilters.tags && appliedFilters.tags.length > 0) {
        queryParams.set('tags', appliedFilters.tags.join(','));
      }
      if (appliedFilters.search) queryParams.set('search', appliedFilters.search);
      if (appliedFilters.limit) queryParams.set('limit', appliedFilters.limit.toString());
      if (appliedFilters.offset) queryParams.set('offset', appliedFilters.offset.toString());
      if (appliedFilters.sortBy) queryParams.set('sortBy', appliedFilters.sortBy);
      if (appliedFilters.sortDirection) queryParams.set('sortDirection', appliedFilters.sortDirection);
      
      const response = await fetchProtected(`/api/protected/inventory?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load inventory: ${response.statusText}`);
      }
      
      const data = await response.json();
      setInventoryItems(data.items || []);
      */
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load a single inventory item by ID
  const loadInventoryItem = async (itemId: string): Promise<InventoryItem | null> => {
    if (!isAuthenticated) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchProtected(`/api/protected/inventory/${itemId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Inventory item not found');
          return null;
        }
        throw new Error(`Failed to load inventory item: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCurrentItem(data.item);
      return data.item;
    } catch (err) {
      console.error('Error loading inventory item:', err);
      setError(err instanceof Error ? err.message : 'Failed to load inventory item');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load usage data for an inventory item
  const loadItemUsage = async (itemId: string): Promise<InventoryItemUsage | null> => {
    if (!isAuthenticated) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // This usage data is already included when loading an item
      if (currentItem && currentItem.id === itemId && currentItem.usage) {
        setItemUsage(currentItem.usage);
        return currentItem.usage;
      }
      
      // If we don't have it, load the item to get usage data
      const item = await loadInventoryItem(itemId);
      if (item && item.usage) {
        setItemUsage(item.usage);
        return item.usage;
      }
      
      return null;
    } catch (err) {
      console.error('Error loading item usage:', err);
      setError(err instanceof Error ? err.message : 'Failed to load item usage');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load consumption history for an inventory item
  const loadConsumptionHistory = async (itemId: string): Promise<InventoryConsumption[]> => {
    if (!isAuthenticated) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchProtected(`/api/protected/inventory/${itemId}/consumption-history`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Inventory item not found');
          return [];
        }
        throw new Error(`Failed to fetch consumption history: ${response.status}`);
      }
      
      const data = await response.json();
      setConsumptionHistory(data.consumptionHistory || []);
      return data.consumptionHistory || [];
    } catch (err) {
      console.error('Error loading consumption history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load consumption history');
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new inventory item
  const createInventoryItem = async (itemData: InventoryItemCreate): Promise<InventoryItem | null> => {
    if (!isAuthenticated) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchProtected('/api/protected/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create inventory item: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCurrentItem(data.item);
      return data.item;
    } catch (err) {
      console.error('Error creating inventory item:', err);
      setError(err instanceof Error ? err.message : 'Failed to create inventory item');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update an existing inventory item
  const updateInventoryItem = async (itemId: string, itemData: Partial<InventoryItemCreate>): Promise<InventoryItem | null> => {
    if (!isAuthenticated) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchProtected(`/api/protected/inventory/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update inventory item: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCurrentItem(data.item);
      return data.item;
    } catch (err) {
      console.error('Error updating inventory item:', err);
      setError(err instanceof Error ? err.message : 'Failed to update inventory item');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete an inventory item
  const deleteInventoryItem = async (itemId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchProtected(`/api/protected/inventory/${itemId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete inventory item: ${response.statusText}`);
      }
      
      setCurrentItem(null);
      return true;
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete inventory item');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter management
  const setFilter = <K extends keyof InventoryFilters>(key: K, value: InventoryFilters[K]) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [key]: value
    }));
  };
  
  const clearFilters = () => {
    setFilters({
      limit: 20,
      offset: 0,
      sortBy: 'purchaseDate',
      sortDirection: 'desc'
    });
  };
  
  return (
    <InventoryContext.Provider value={{
      inventoryItems,
      currentItem,
      itemUsage,
      consumptionHistory,
      isLoading,
      error,
      filters,
      loadInventory,
      loadInventoryItem,
      loadItemUsage,
      loadConsumptionHistory,
      createInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      setFilter,
      clearFilters
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

// Custom hook to use the InventoryContext
export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === null) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};