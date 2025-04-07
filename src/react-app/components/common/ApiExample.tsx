import React, { useEffect, useState } from 'react';
import { API, ENDPOINTS, getEnvironment } from '../../../config/ecosystem';

/**
 * Example component demonstrating proper API usage with ecosystem configuration
 */
const ApiExample: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [environment, setEnvironment] = useState(getEnvironment());

  // Example of how to make an API call using the ecosystem configuration
  const fetchApiData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the appropriate API URL for the current environment
      const apiUrl = API.KUSHOBSERVER.HEALTH(environment);
      
      // Make the API call
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add auth token if needed
          // 'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const responseData = await response.json();
      setData(responseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle between environments for demonstration
  const toggleEnvironment = () => {
    setEnvironment(prev => {
      if (prev === 'PRODUCTION') return 'STAGING';
      if (prev === 'STAGING') return 'DEVELOPMENT';
      return 'PRODUCTION';
    });
  };
  
  return (
    <div className="api-example p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">API Integration Example</h2>
      
      <div className="mb-4">
        <p className="mb-2"><strong>Current Environment:</strong> {environment}</p>
        <button 
          onClick={toggleEnvironment}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
        >
          Toggle Environment
        </button>
      </div>
      
      <div className="mb-4">
        <p className="mb-2"><strong>Endpoint URLs:</strong></p>
        <ul className="list-disc pl-5">
          <li>SeshTracker: {ENDPOINTS.SESHTRACKER[environment]}</li>
          <li>Kush.Observer: {ENDPOINTS.KUSHOBSERVER[environment]}</li>
          <li>My-Cannabis-Tracker: {ENDPOINTS.MYCANNABIS[environment]}</li>
        </ul>
      </div>
      
      <div className="mb-4">
        <p className="mb-2"><strong>API Paths:</strong></p>
        <ul className="list-disc pl-5">
          <li>Auth Validate: {API.KUSHOBSERVER.AUTH.VALIDATE(environment)}</li>
          <li>Sessions: {API.SESHTRACKER.SESSIONS(environment)}</li>
          <li>Admin Users: {API.MYCANNABIS.ADMIN.USERS(environment)}</li>
        </ul>
      </div>
      
      <div className="mb-4">
        <button 
          onClick={fetchApiData} 
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Loading...' : 'Fetch API Data'}
        </button>
      </div>
      
      {error && (
        <div className="text-red-500 mb-4">
          Error: {error}
        </div>
      )}
      
      {data && (
        <div className="mb-4">
          <p className="mb-2"><strong>Response Data:</strong></p>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Note:</strong> This component demonstrates proper usage of the ecosystem 
          configuration from <code>src/config/ecosystem.ts</code> to ensure all
          links and endpoints follow our standardized format.
        </p>
      </div>
    </div>
  );
};

export default ApiExample; 