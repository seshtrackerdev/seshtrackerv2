import { useAuth } from '../hooks';

// Base API URLs
const KUSH_API_URL = 'https://kush.observer';
const BASE_API_URL = '/api/protected'; // Local API endpoint that proxies to KushObserver

/**
 * API helper functions for interacting with the KushObserver API
 * These functions handle data fetching for sessions, inventory, and user profiles
 */

// User Profile API Functions
export const fetchUserProfile = async () => {
  const { fetchProtected } = useAuth();
  try {
    const response = await fetchProtected(`${BASE_API_URL}/user-profile`);
    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData: any) => {
  const { fetchProtected } = useAuth();
  try {
    const response = await fetchProtected(`${BASE_API_URL}/user-profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Sessions API Functions
export const fetchSessions = async (limit = 20, sortBy = 'startTime', sortDirection = 'desc') => {
  const { fetchProtected } = useAuth();
  try {
    const response = await fetchProtected(
      `${BASE_API_URL}/sessions?limit=${limit}&sortBy=${sortBy}&sortDirection=${sortDirection}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch sessions: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

export const fetchSessionById = async (sessionId: string) => {
  const { fetchProtected } = useAuth();
  try {
    const response = await fetchProtected(`${BASE_API_URL}/sessions/${sessionId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch session: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching session ${sessionId}:`, error);
    throw error;
  }
};

export const createSession = async (sessionData: any) => {
  const { fetchProtected } = useAuth();
  try {
    const response = await fetchProtected(`${BASE_API_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

export const updateSession = async (sessionId: string, sessionData: any) => {
  const { fetchProtected } = useAuth();
  try {
    const response = await fetchProtected(`${BASE_API_URL}/sessions/${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update session: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error updating session ${sessionId}:`, error);
    throw error;
  }
};

export const deleteSession = async (sessionId: string) => {
  const { fetchProtected } = useAuth();
  try {
    const response = await fetchProtected(`${BASE_API_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete session: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error deleting session ${sessionId}:`, error);
    throw error;
  }
};

// Inventory API Functions
export const fetchInventory = async (limit = 20, sortBy = 'purchaseDate', sortDirection = 'desc') => {
  const { fetchProtected } = useAuth();
  try {
    const response = await fetchProtected(
      `${BASE_API_URL}/inventory?limit=${limit}&sortBy=${sortBy}&sortDirection=${sortDirection}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch inventory: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
};

export const fetchInventoryById = async (inventoryId: string) => {
  const { fetchProtected } = useAuth();
  try {
    const response = await fetchProtected(`${BASE_API_URL}/inventory/${inventoryId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch inventory item: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching inventory item ${inventoryId}:`, error);
    throw error;
  }
};

export const createInventoryItem = async (inventoryData: any) => {
  const { fetchProtected } = useAuth();
  try {
    const response = await fetchProtected(`${BASE_API_URL}/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inventoryData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create inventory item: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw error;
  }
};

export const updateInventoryItem = async (inventoryId: string, inventoryData: any) => {
  const { fetchProtected } = useAuth();
  try {
    const response = await fetchProtected(`${BASE_API_URL}/inventory/${inventoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inventoryData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update inventory item: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error updating inventory item ${inventoryId}:`, error);
    throw error;
  }
};

export const deleteInventoryItem = async (inventoryId: string) => {
  const { fetchProtected } = useAuth();
  try {
    const response = await fetchProtected(`${BASE_API_URL}/inventory/${inventoryId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete inventory item: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error deleting inventory item ${inventoryId}:`, error);
    throw error;
  }
};

// Strain Data API Functions
export const fetchStrainLibrary = async (limit = 50, offset = 0, searchTerm = '') => {
  const { fetchProtected } = useAuth();
  try {
    let url = `${BASE_API_URL}/strains?limit=${limit}&offset=${offset}`;
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }
    
    const response = await fetchProtected(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch strain library: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching strain library:', error);
    throw error;
  }
};

export const fetchStrainDetails = async (strainId: string) => {
  const { fetchProtected } = useAuth();
  try {
    const response = await fetchProtected(`${BASE_API_URL}/strains/${strainId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch strain details: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching strain details ${strainId}:`, error);
    throw error;
  }
};

// Analytics API Functions
export const fetchUserAnalytics = async (timeframe = 'all') => {
  const { fetchProtected } = useAuth();
  try {
    const response = await fetchProtected(`${BASE_API_URL}/analytics?timeframe=${timeframe}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch analytics: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

// Export a function to create a custom fetchProtected wrapper
// This is useful when components can't use hooks directly
export const createApiClient = (fetchProtectedFn: any) => {
  return {
    // User Profile
    fetchUserProfile: async () => {
      try {
        const response = await fetchProtectedFn(`${BASE_API_URL}/user-profile`);
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
    },
    
    // Sessions
    fetchSessions: async (limit = 20, sortBy = 'startTime', sortDirection = 'desc') => {
      try {
        const response = await fetchProtectedFn(
          `${BASE_API_URL}/sessions?limit=${limit}&sortBy=${sortBy}&sortDirection=${sortDirection}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch sessions: ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching sessions:', error);
        throw error;
      }
    },
    
    // Inventory
    fetchInventory: async (limit = 20, sortBy = 'purchaseDate', sortDirection = 'desc') => {
      try {
        const response = await fetchProtectedFn(
          `${BASE_API_URL}/inventory?limit=${limit}&sortBy=${sortBy}&sortDirection=${sortDirection}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch inventory: ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching inventory:', error);
        throw error;
      }
    },
    
    // Add other methods as needed
  };
}; 