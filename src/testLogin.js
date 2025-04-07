/**
 * Test script for KushObserver API integration
 */
import fetch from 'node-fetch';

async function testKushObserverIntegration() {
  console.log('Testing KushObserver API Integration...\n');
  
  const API_URL = 'https://kushobserver.tmultidev.workers.dev/api';
  let token = '';
  
  // Step 1: Test login
  console.log('Step 1: Testing login...');
  try {
    const loginResponse = await fetch(`${API_URL}/direct-login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Origin': 'https://sesh-tracker.com',
        'Referer': 'https://sesh-tracker.com'
      },
      body: JSON.stringify({
        email: 'tester@email.com',
        password: 'Superbowl9-Veggie0-Credit4-Watch1'
      })
    });
    
    console.log(`Login status: ${loginResponse.status} ${loginResponse.statusText}`);
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginData.success && loginData.token) {
      console.log('✅ Login successful!');
      token = loginData.token;
    } else {
      console.log('❌ Login failed!');
      return;
    }
  } catch (error) {
    console.error('Login error:', error.message);
    return;
  }
  
  // Step 2: Test getting user profile
  console.log('\nStep 2: Testing user profile...');
  try {
    const profileResponse = await fetch(`${API_URL}/protected/user-profile`, {
      headers: { 
        'Content-Type': 'application/json',
        'Origin': 'https://sesh-tracker.com',
        'Referer': 'https://sesh-tracker.com',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`Profile status: ${profileResponse.status} ${profileResponse.statusText}`);
    const profileData = await profileResponse.json();
    console.log('Profile data:', profileData);
    
    if (profileData.success) {
      console.log('✅ Profile fetch successful!');
    } else {
      console.log('❌ Profile fetch failed!');
    }
  } catch (error) {
    console.error('Profile error:', error.message);
  }
  
  // Step 3: Test inventory API with pagination
  console.log('\nStep 3: Testing inventory API...');
  try {
    const inventoryResponse = await fetch(`${API_URL}/protected/inventory?limit=25&offset=0&sortBy=purchase_date&sortDirection=desc`, {
      headers: { 
        'Content-Type': 'application/json',
        'Origin': 'https://sesh-tracker.com',
        'Referer': 'https://sesh-tracker.com',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`Inventory status: ${inventoryResponse.status} ${inventoryResponse.statusText}`);
    const inventoryData = await inventoryResponse.json();
    console.log(`Inventory items count: ${inventoryData.items ? inventoryData.items.length : 0}`);
    console.log(`Total inventory items: ${inventoryData.total || 0}`);
    
    if (inventoryData.items && inventoryData.items.length >= 25) {
      console.log('✅ Inventory fetch successful with minimum 25 items!');
    } else if (inventoryData.items) {
      console.log('✅ Inventory fetch successful!');
    } else {
      console.log('❌ Inventory fetch failed or returned no items!');
    }
  } catch (error) {
    console.error('Inventory error:', error.message);
  }
  
  // Step 4: Test sessions API with pagination
  console.log('\nStep 4: Testing sessions API...');
  try {
    const sessionsResponse = await fetch(`${API_URL}/protected/sessions?limit=50&offset=0&sortBy=start_time&sortDirection=desc`, {
      headers: { 
        'Content-Type': 'application/json',
        'Origin': 'https://sesh-tracker.com',
        'Referer': 'https://sesh-tracker.com',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`Sessions status: ${sessionsResponse.status} ${sessionsResponse.statusText}`);
    const sessionsData = await sessionsResponse.json();
    console.log(`Sessions count: ${sessionsData.items ? sessionsData.items.length : 0}`);
    console.log(`Total sessions: ${sessionsData.total || 0}`);
    
    if (sessionsData.items && sessionsData.items.length >= 50) {
      console.log('✅ Sessions fetch successful with minimum 50 items!');
    } else if (sessionsData.items) {
      console.log('✅ Sessions fetch successful!');
    } else {
      console.log('❌ Sessions fetch failed or returned no sessions!');
    }
  } catch (error) {
    console.error('Sessions error:', error.message);
  }
  
  // Step 5: Test pagination with second page of inventory
  console.log('\nStep 5: Testing pagination (second page of inventory)...');
  try {
    const page2Response = await fetch(`${API_URL}/protected/inventory?limit=25&offset=25&sortBy=purchase_date&sortDirection=desc`, {
      headers: { 
        'Content-Type': 'application/json',
        'Origin': 'https://sesh-tracker.com',
        'Referer': 'https://sesh-tracker.com',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`Page 2 status: ${page2Response.status} ${page2Response.statusText}`);
    const page2Data = await page2Response.json();
    console.log(`Page 2 items count: ${page2Data.items ? page2Data.items.length : 0}`);
    
    if (page2Data.items) {
      console.log('✅ Pagination fetch successful!');
    } else {
      console.log('❌ Pagination fetch failed!');
    }
  } catch (error) {
    console.error('Pagination error:', error.message);
  }
  
  console.log('\n✨ Integration testing complete!');
}

// Run the tests
testKushObserverIntegration(); 