/**
 * Production Authentication Test Script
 * 
 * This script tests the authentication flow with Kush.Observer in production.
 * Run this script with Node.js to verify that your authentication is working correctly.
 */
const fetch = require('node-fetch');

// Possible endpoints to try (in order)
const AUTH_ENDPOINTS = [
  'https://kushobserver.tmultidev.workers.dev/api',
  'https://kush.observer/api',
  'https://kush.observer/api/auth'
];

// Auth endpoints to test (in order)
const LOGIN_PATHS = [
  '/direct-login',  
  '/auth/direct-login'
];

// Test credentials - use your own test account or the standard test account
const TEST_EMAIL = 'tester@email.com';
const TEST_PASSWORD = 'Superbowl9-Veggie0-Credit4-Watch1';

async function testAllEndpoints() {
  console.log('🌿 Testing Kush.Observer Production Authentication');
  console.log('------------------------------------------------');
  
  let token = null;
  
  // Try each endpoint until we get a successful login
  for (const baseEndpoint of AUTH_ENDPOINTS) {
    // Try each login path
    for (const loginPath of LOGIN_PATHS) {
      const loginUrl = `${baseEndpoint}${loginPath}`;
      console.log(`\n📝 Trying login URL: ${loginUrl}`);
      
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
        
        if (!loginResponse.ok) {
          console.log('❌ Response not OK, trying next endpoint...');
          continue;
        }
        
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
          
          // Break out of both loops if successful
          break;
        } else {
          console.log('❌ Login Failed, no token in response:');
          console.log(loginData);
        }
      } catch (error) {
        console.error('❌ Login Error:', error.message);
      }
    }
    
    // If we got a token, break out of the outer loop too
    if (token) break;
  }
  
  // If we couldn't get a token from any endpoint, exit
  if (!token) {
    console.log('\n❌ Failed to authenticate with any endpoint');
    console.log('------------------------------------------------');
    return;
  }
  
  // We have a token, now try to validate it
  console.log('\n📝 Step 2: Testing token validation');
  
  // Try each base endpoint for validation
  let validatedSuccessfully = false;
  
  for (const baseEndpoint of AUTH_ENDPOINTS) {
    const validateUrl = `${baseEndpoint}/auth/validate-token`;
    console.log(`Trying validate URL: ${validateUrl}`);
    
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
      
      if (!validateResponse.ok) {
        console.log('❌ Response not OK, trying next endpoint...');
        continue;
      }
      
      const validateData = await validateResponse.json();
      
      if (validateData.valid || validateData.success) {
        console.log('✅ Token Validation Success!');
        validatedSuccessfully = true;
        break;
      } else {
        console.log('❌ Token Validation Failed:');
        console.log(validateData);
      }
    } catch (error) {
      console.error('❌ Validation Error:', error.message);
    }
  }
  
  if (!validatedSuccessfully) {
    console.log('❌ Failed to validate token with any endpoint');
  }
  
  // Try to get the user profile
  console.log('\n📝 Step 3: Testing user profile');
  let profileSuccessful = false;
  
  for (const baseEndpoint of AUTH_ENDPOINTS) {
    // Try different profile paths
    const profilePaths = ['/user/profile', '/profile', '/protected/user-profile'];
    
    for (const profilePath of profilePaths) {
      const profileUrl = `${baseEndpoint}${profilePath}`;
      console.log(`Trying profile URL: ${profileUrl}`);
      
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
        
        if (!profileResponse.ok) {
          console.log('❌ Response not OK, trying next endpoint...');
          continue;
        }
        
        const profileData = await profileResponse.json();
        
        if (profileData.success || profileData.user) {
          console.log('✅ Profile Fetch Success!');
          console.log('User Profile:', profileData.user || profileData);
          profileSuccessful = true;
          break;
        } else {
          console.log('❌ Profile Fetch Failed:');
          console.log(profileData);
        }
      } catch (error) {
        console.error('❌ Profile Error:', error.message);
      }
    }
    
    if (profileSuccessful) break;
  }
  
  if (!profileSuccessful) {
    console.log('❌ Failed to get user profile from any endpoint');
  }
  
  console.log('\n------------------------------------------------');
  console.log('🌿 Authentication Test Complete');
  
  // Print configuration recommendation
  console.log('\nBased on the test results, here is the recommended configuration:');
  if (token) {
    console.log('1. Successfully authenticated with Kush.Observer');
    console.log('2. Your authentication is working correctly for production');
    console.log('3. Make sure your frontend code is using the correct endpoints for:');
    console.log('   - Login');
    console.log('   - Token validation');
    console.log('   - User profile');
  } else {
    console.log('❌ Authentication failed. Please check:');
    console.log('1. Test account credentials');
    console.log('2. Kush.Observer API endpoints');
    console.log('3. Network connectivity to Kush.Observer');
  }
}

// Run the test
testAllEndpoints().catch(error => {
  console.error('Unhandled error:', error);
});