import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useAuth } from '../hooks';
import { 
  Session, 
  SessionCreate, 
  SessionProduct, 
  SessionSummary,
  SessionFilters
} from '../../types/session';
import { InventoryConsumption } from '../../types/inventory';

// Define the context type
interface SessionContextType {
  // Session data
  sessions: SessionSummary[];
  currentSession: Session | null;
  isLoading: boolean;
  error: string | null;
  filters: SessionFilters;
  
  // Session actions
  loadSessions: (filters?: SessionFilters) => Promise<void>;
  loadSession: (sessionId: string) => Promise<Session | null>;
  createSession: (sessionData: SessionCreate) => Promise<Session | null>;
  updateSession: (sessionId: string, sessionData: Partial<SessionCreate>) => Promise<Session | null>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  
  // Session-Inventory integration
  consumeInventory: (
    sessionId: string, 
    inventoryItemId: string, 
    amountUsed: number
  ) => Promise<InventoryConsumption | null>;
  
  // Filter management
  setFilter: <K extends keyof SessionFilters>(key: K, value: SessionFilters[K]) => void;
  clearFilters: () => void;
}

// Create the context with a default value
const SessionContext = createContext<SessionContextType | null>(null);

// Provider component
export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { fetchProtected, isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SessionFilters>({
    limit: 20,
    offset: 0,
    sortBy: 'startTime',
    sortDirection: 'desc'
  });
  
  // Use a ref to track loading state across renders and prevent multiple API calls
  const loadingRef = useRef(false);
  
  // Load sessions based on filters
  const loadSessions = async (newFilters?: SessionFilters): Promise<void> => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    // Update filters if provided
    const appliedFilters = newFilters ? { ...filters, ...newFilters } : filters;
    
    // IMPORTANT: Don't update filters state here as it will cause re-renders and potential infinite loops
    // We only update filters through setFilter or clearFilters functions
    
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      
      if (appliedFilters.startDate) queryParams.set('startDate', appliedFilters.startDate);
      if (appliedFilters.endDate) queryParams.set('endDate', appliedFilters.endDate);
      if (appliedFilters.consumptionMethod && appliedFilters.consumptionMethod.length > 0) {
        queryParams.set('methods', appliedFilters.consumptionMethod.join(','));
      }
      if (appliedFilters.minRating !== undefined) queryParams.set('minRating', appliedFilters.minRating.toString());
      if (appliedFilters.maxRating !== undefined) queryParams.set('maxRating', appliedFilters.maxRating.toString());
      if (appliedFilters.search) queryParams.set('search', appliedFilters.search);
      if (appliedFilters.limit) queryParams.set('limit', appliedFilters.limit.toString());
      if (appliedFilters.offset) queryParams.set('offset', appliedFilters.offset.toString());
      if (appliedFilters.sortBy) queryParams.set('sortBy', appliedFilters.sortBy);
      if (appliedFilters.sortDirection) queryParams.set('sortDirection', appliedFilters.sortDirection);
      
      const response = await fetchProtected(`/api/protected/sessions?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load sessions: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load a single session by ID
  const loadSession = async (sessionId: string): Promise<Session | null> => {
    if (!isAuthenticated) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchProtected(`/api/protected/sessions/${sessionId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Session not found');
          return null;
        }
        throw new Error(`Failed to load session: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCurrentSession(data.session);
      return data.session;
    } catch (err) {
      console.error('Error loading session:', err);
      setError(err instanceof Error ? err.message : 'Failed to load session');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new session
  const createSession = async (sessionData: SessionCreate): Promise<Session | null> => {
    if (!isAuthenticated) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchProtected('/api/protected/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Add the new session to the list and set as current
      setCurrentSession(data.session);
      
      // Reload sessions to get updated list
      await loadSessions();
      
      return data.session;
    } catch (err) {
      console.error('Error creating session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create session');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update an existing session
  const updateSession = async (sessionId: string, sessionData: Partial<SessionCreate>): Promise<Session | null> => {
    if (!isAuthenticated) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchProtected(`/api/protected/sessions/${sessionId}`, {
        method: 'PUT',
        body: JSON.stringify(sessionData)
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Session not found');
          return null;
        }
        throw new Error(`Failed to update session: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update current session if it matches
      if (currentSession && currentSession.id === sessionId) {
        setCurrentSession(data.session);
      }
      
      // Reload sessions to get updated list
      await loadSessions();
      
      return data.session;
    } catch (err) {
      console.error('Error updating session:', err);
      setError(err instanceof Error ? err.message : 'Failed to update session');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete a session
  const deleteSession = async (sessionId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchProtected(`/api/protected/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Session not found');
          return false;
        }
        throw new Error(`Failed to delete session: ${response.statusText}`);
      }
      
      // Clear current session if it matches
      if (currentSession && currentSession.id === sessionId) {
        setCurrentSession(null);
      }
      
      // Reload sessions to get updated list
      await loadSessions();
      
      return true;
    } catch (err) {
      console.error('Error deleting session:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete session');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Record inventory consumption in a session
  const consumeInventory = async (
    sessionId: string,
    inventoryItemId: string,
    amountUsed: number
  ): Promise<InventoryConsumption | null> => {
    if (!isAuthenticated) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchProtected(`/api/protected/sessions/${sessionId}/consume-inventory`, {
        method: 'POST',
        body: JSON.stringify({
          inventoryItemId,
          amountUsed
        })
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Session or inventory item not found');
          return null;
        }
        throw new Error(`Failed to consume inventory: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Reload current session to get updated data
      if (currentSession && currentSession.id === sessionId) {
        await loadSession(sessionId);
      }
      
      return data.consumption;
    } catch (err) {
      console.error('Error consuming inventory:', err);
      setError(err instanceof Error ? err.message : 'Failed to consume inventory');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter management functions
  const setFilter = <K extends keyof SessionFilters>(key: K, value: SessionFilters[K]) => {
    // Update filters first
    const newFilters = {
      ...filters,
      [key]: value
    };
    
    // Set the new filters
    setFilters(newFilters);
    
    // Only load sessions with the new filters if authenticated and not already loading
    if (isAuthenticated && !loadingRef.current) {
      // Set loading flag
      loadingRef.current = true;
      // Pass the new filters directly to loadSessions to avoid state update timing issues
      loadSessions(newFilters).finally(() => {
        loadingRef.current = false;
      });
    }
  };
  
  const clearFilters = () => {
    // Create default filters
    const defaultFilters: SessionFilters = {
      limit: 20,
      offset: 0,
      sortBy: 'startTime',
      sortDirection: 'desc'
    };
    
    // Set the filters
    setFilters(defaultFilters);
    
    // Reload with cleared filters if authenticated and not already loading
    if (isAuthenticated && !loadingRef.current) {
      // Set loading flag
      loadingRef.current = true;
      // Pass the default filters directly to loadSessions
      loadSessions(defaultFilters).finally(() => {
        loadingRef.current = false;
      });
    }
  };
  
  // Load sessions when authenticated only
  // DO NOT add filters as a dependency as it will cause an infinite loop
  useEffect(() => {
    if (isAuthenticated && !loadingRef.current) {
      // Set loading flag
      loadingRef.current = true;
      // Initial load with current filters
      loadSessions().finally(() => {
        loadingRef.current = false;
      });
    }
  }, [isAuthenticated]); // Keep isAuthenticated as the only dependency
  
  const value: SessionContextType = {
    sessions,
    currentSession,
    isLoading,
    error,
    filters,
    loadSessions,
    loadSession,
    createSession,
    updateSession,
    deleteSession,
    consumeInventory,
    setFilter,
    clearFilters
  };
  
  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

// Custom hook to use the session context
export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  
  return context;
}; 