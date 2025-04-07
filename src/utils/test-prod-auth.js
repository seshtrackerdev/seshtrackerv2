/**
 * Production Authentication Test Script
 * 
 * This script tests the authentication flow with Kush.Observer in production.
 * Run this script with Node.js to verify that your authentication is working correctly.
 */
const fetch = require('node-fetch');

// Production endpoints
const KUSH_API_URL = 'https://kush.observer/api';

// Test credentials - use your own test account or the standard test account
const TEST_EMAIL = 'tester@email.com';
const TEST_PASSWORD = 'Superbowl9-Veggie0-Credit4-Watch1';

async function testProdAuth() {
  console.log('🌿 Testing Kush.Observer Production Authentication');
  console.log('------------------------------------------------');
  
  // Step 1: Test direct login to Kush.Observer
  console.log('\n📝 Step 1: Testing direct login to Kush.Observer');
  const loginUrl = `${KUSH_API_URL}/auth/direct-login`;
  console.log(`Login URL: ${loginUrl}`);
  
  let token = '';
  try {
    const loginResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://sesh-tracker.com'
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });
    
    console.log(`Login Status: ${loginResponse.status} ${loginResponse.statusText}`);
    const loginData = await loginResponse.json();
    
    if (loginData.token) {
      console.log('✅ Login Success! Token received.');
      token = loginData.token;
      
      // Display user info if available
      if (loginData.user) {
        console.log(`User ID: ${loginData.user.id}`);
        console.log(`Email: ${loginData.user.email}`);
        console.log(`Name: ${loginData.user.name || 'Not provided'}`);
      }
    } else {
      console.log('❌ Login Failed!');
      console.log(loginData);
      return;
    }
  } catch (error) {
    console.error('❌ Login Error:', error.message);
    return;
  }
  
  // Step 2: Test token validation
  if (token) {
    console.log('\n📝 Step 2: Testing token validation');
    const validateUrl = `${KUSH_API_URL}/auth/validate-token`;
    console.log(`Validate URL: ${validateUrl}`);
    
    try {
      const validateResponse = await fetch(validateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://sesh-tracker.com'
        },
        body: JSON.stringify({ token })
      });
      
      console.log(`Validation Status: ${validateResponse.status} ${validateResponse.statusText}`);
      const validateData = await validateResponse.json();
      
      if (validateData.valid || validateData.success) {
        console.log('✅ Token Validation Success!');
      } else {
        console.log('❌ Token Validation Failed!');
        console.log(validateData);
      }
    } catch (error) {
      console.error('❌ Validation Error:', error.message);
    }
    
    // Step 3: Test getting user profile
    console.log('\n📝 Step 3: Testing user profile');
    const profileUrl = `${KUSH_API_URL}/user/profile`;
    console.log(`Profile URL: ${profileUrl}`);
    
    try {
      const profileResponse = await fetch(profileUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Origin': 'https://sesh-tracker.com'
        }
      });
      
      console.log(`Profile Status: ${profileResponse.status} ${profileResponse.statusText}`);
      const profileData = await profileResponse.json();
      
      if (profileData.success || profileData.user) {
        console.log('✅ Profile Fetch Success!');
        console.log('User Profile:', profileData.user || profileData);
      } else {
        console.log('❌ Profile Fetch Failed!');
        console.log(profileData);
      }
    } catch (error) {
      console.error('❌ Profile Error:', error.message);
    }
  }
  
  console.log('\n------------------------------------------------');
  console.log('🌿 Authentication Test Complete');
}

// Run the test
testProdAuth().catch(error => {
  console.error('Unhandled error:', error);
}); 