// Test script for KushObserver integration
interface TestResponse {
  success?: boolean;
  error?: string;
  [key: string]: unknown;
}

// Define test configuration
const API_URL = 'https://kushobserver.tmultidev.workers.dev';
const TEST_EMAIL = 'tester@email.com';
const TEST_PASSWORD = 'Superbowl9-Veggie0-Credit4-Watch1';
const DOMAIN = 'sesh-tracker.com';

// Enhanced test categories for better organization
enum TestCategory {
  CONNECTIVITY = "Connectivity",
  CORS = "CORS Configuration",
  AUTH = "Authentication",
  PASSWORD_RESET = "Password Reset Flow",
  PROFILE = "Profile Operations",
  SUBSCRIPTION = "Subscription Services"
}

// Test result tracking
interface TestResult {
  name: string;
  category: TestCategory;
  success: boolean;
  message: string;
  details?: any;
}

const testKushIntegration = async (): Promise<TestResult[]> => {
  console.log('Starting KushObserver integration test...');
  const results: TestResult[] = [];
  let authToken: string | null = null; // Store auth token for authenticated tests

  const addResult = (name: string, category: TestCategory, success: boolean, message: string, details?: any) => {
    results.push({ name, category, success, message, details });
    if (success) {
      console.log(`✅ [${category}] ${name}: ${message}`);
    } else {
      console.error(`❌ [${category}] ${name}: ${message}`);
    }
    if (details) {
      console.log('Details:', details);
    }
  };

  try {
    // 1. Test the API health
    console.log('\n1. Testing API health...');
    try {
      const healthResponse = await fetch(`${API_URL}/api/health`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Origin': `https://${DOMAIN}`,
          'Referer': `https://${DOMAIN}`
        }
      });
      
      if (healthResponse.ok) {
        addResult(
          "API Health Check", 
          TestCategory.CONNECTIVITY, 
          true, 
          `Health endpoint returned ${healthResponse.status} ${healthResponse.statusText}`
        );
      } else {
        addResult(
          "API Health Check", 
          TestCategory.CONNECTIVITY, 
          false, 
          `Health endpoint returned ${healthResponse.status} ${healthResponse.statusText}`
        );
      }
    } catch (error) {
      addResult(
        "API Health Check", 
        TestCategory.CONNECTIVITY, 
        false, 
        `Request failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
    
    // 2. Test CORS preflight with OPTIONS
    console.log('\n2. Testing CORS preflight with OPTIONS...');
    try {
      const corsResponse = await fetch(`${API_URL}/api/profile`, {
        method: 'OPTIONS',
        headers: {
          'Origin': `https://${DOMAIN}`,
          'Access-Control-Request-Method': 'GET', 
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });
      
      const allowOrigin = corsResponse.headers.get('Access-Control-Allow-Origin');
      const allowMethods = corsResponse.headers.get('Access-Control-Allow-Methods');
      const allowHeaders = corsResponse.headers.get('Access-Control-Allow-Headers');
      
      console.log('Preflight response status:', corsResponse.status);
      
      // Test CORS headers - fix: ensure boolean value by using !!
      const corsHeadersComplete = !!(allowOrigin && allowMethods && allowHeaders);
      addResult(
        "CORS Headers Present", 
        TestCategory.CORS, 
        corsHeadersComplete, 
        corsHeadersComplete ? "All required CORS headers are present" : "Some CORS headers are missing", 
        { allowOrigin, allowMethods, allowHeaders }
      );
      
      // Test domain allowance
      if (allowOrigin) {
        const domainAllowed = allowOrigin === '*' || allowOrigin.includes(DOMAIN);
        addResult(
          "Domain Allowed", 
          TestCategory.CORS, 
          domainAllowed, 
          domainAllowed ? `Domain ${DOMAIN} is allowed in CORS policy` : `Domain ${DOMAIN} not allowed in CORS policy`,
          { allowOrigin }
        );
      }
      
      // Test HTTP methods
      if (allowMethods) {
        const requiredMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
        const allowedMethodsList = allowMethods.split(',').map(m => m.trim());
        
        for (const method of requiredMethods) {
          const methodAllowed = allowedMethodsList.includes(method) || allowMethods.includes('*');
          addResult(
            `HTTP ${method} Method Allowed`, 
            TestCategory.CORS, 
            methodAllowed, 
            methodAllowed ? `HTTP ${method} method is allowed` : `HTTP ${method} method is not allowed`,
            { allowMethods }
          );
        }
      }
    } catch (corsError) {
      addResult(
        "CORS Preflight", 
        TestCategory.CORS, 
        false, 
        `Request failed: ${corsError instanceof Error ? corsError.message : String(corsError)}`
      );
    }
    
    // 3. Test password reset request flow with resetUrl parameter
    console.log('\n3. Testing password reset request with resetUrl parameter...');
    try {
      const resetUrl = `https://${DOMAIN}/reset-password?token=`;
      const resetResponse = await fetch(`${API_URL}/reset`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Origin': `https://${DOMAIN}`,
          'Referer': `https://${DOMAIN}`
        },
        body: JSON.stringify({
          email: TEST_EMAIL,
          resetUrl: resetUrl
        })
      });
      
      const resetData = await resetResponse.json() as TestResponse;
      
      addResult(
        "Password Reset Request", 
        TestCategory.PASSWORD_RESET, 
        resetResponse.ok, 
        resetResponse.ok ? "Password reset request accepted" : `Password reset request failed: ${resetResponse.status}`,
        resetData
      );
    } catch (resetError) {
      addResult(
        "Password Reset Request", 
        TestCategory.PASSWORD_RESET, 
        false, 
        `Request failed: ${resetError instanceof Error ? resetError.message : String(resetError)}`
      );
    }
    
    // 4. Test password reset with token and domain parameters
    console.log('\n4. Testing password reset with token and domain parameters...');
    try {
      const mockToken = 'test-token-123456789';
      const resetWithTokenResponse = await fetch(`${API_URL}/api/password-reset`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Origin': `https://${DOMAIN}`,
          'Referer': `https://${DOMAIN}`
        },
        body: JSON.stringify({
          token: mockToken,
          password: TEST_PASSWORD,
          domain: DOMAIN
        })
      });
      
      const resetWithTokenData = await resetWithTokenResponse.json() as TestResponse;
      
      // We expect this to fail with a fake token, but we want to ensure the endpoint is accessible
      // and accepts the parameters correctly
      addResult(
        "Password Reset Completion", 
        TestCategory.PASSWORD_RESET, 
        resetWithTokenResponse.status !== 500, 
        "Password reset completion endpoint is accessible (failure expected with test token)",
        resetWithTokenData
      );

      // Also test with different password parameter formats
      const passwordFormats = [
        { format: "password", value: { token: mockToken, password: TEST_PASSWORD, domain: DOMAIN } },
        { format: "new_password", value: { token: mockToken, new_password: TEST_PASSWORD, domain: DOMAIN } },
        { format: "newPassword", value: { token: mockToken, newPassword: TEST_PASSWORD, domain: DOMAIN } }
      ];

      for (const format of passwordFormats) {
        const formatTestResponse = await fetch(`${API_URL}/api/password-reset`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Origin': `https://${DOMAIN}`,
            'Referer': `https://${DOMAIN}`
          },
          body: JSON.stringify(format.value)
        });
        
        const formatTestData = await formatTestResponse.json() as TestResponse;
        
        addResult(
          `Password Parameter Format (${format.format})`, 
          TestCategory.PASSWORD_RESET, 
          formatTestResponse.status !== 500, 
          `Password reset with ${format.format} parameter is accessible`,
          formatTestData
        );
      }
    } catch (resetTokenError) {
      addResult(
        "Password Reset Completion", 
        TestCategory.PASSWORD_RESET, 
        false, 
        `Request failed: ${resetTokenError instanceof Error ? resetTokenError.message : String(resetTokenError)}`
      );
    }
    
    // 5. Test PATCH method
    console.log('\n5. Testing CORS with PATCH method...');
    try {
      // First, test OPTIONS preflight for PATCH
      const patchPreflightResponse = await fetch(`${API_URL}/api/profile`, {
        method: 'OPTIONS',
        headers: {
          'Origin': `https://${DOMAIN}`,
          'Access-Control-Request-Method': 'PATCH', 
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });
      
      const patchAllowMethods = patchPreflightResponse.headers.get('Access-Control-Allow-Methods');
      
      addResult(
        "PATCH Method in CORS", 
        TestCategory.CORS, 
        patchAllowMethods !== null && (patchAllowMethods.includes('PATCH') || patchAllowMethods.includes('*')), 
        patchAllowMethods !== null && (patchAllowMethods.includes('PATCH') || patchAllowMethods.includes('*')) 
          ? "PATCH method is allowed in CORS policy" 
          : "PATCH method may not be allowed in CORS policy",
        { patchAllowMethods }
      );
      
      // Now try an actual PATCH request
      const patchResponse = await fetch(`${API_URL}/api/profile`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Origin': `https://${DOMAIN}`,
          'Referer': `https://${DOMAIN}`,
          'Authorization': 'Bearer invalid-token-for-testing'
        },
        body: JSON.stringify({
          name: 'Test User'
        })
      });
      
      // We expect a 401 error with invalid token, but the endpoint should be accessible
      addResult(
        "PATCH Request Endpoint", 
        TestCategory.PROFILE, 
        patchResponse.status === 401, 
        patchResponse.status === 401 
          ? "PATCH request received 401 Unauthorized (expected with invalid token)" 
          : `PATCH request returned unexpected status ${patchResponse.status}`,
        await patchResponse.json().catch(() => null)
      );
    } catch (patchError) {
      addResult(
        "PATCH Method Test", 
        TestCategory.CORS, 
        false, 
        `Request failed: ${patchError instanceof Error ? patchError.message : String(patchError)}`
      );
    }
    
    // 6. Test login connectivity and token acquisition
    console.log('\n6. Testing authentication endpoints...');
    try {
      const loginConnectivityResponse = await fetch(`${API_URL}/api/direct-login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Origin': `https://${DOMAIN}`,
          'Referer': `https://${DOMAIN}`  
        },
        body: JSON.stringify({
          email: 'connectivity-test@example.com', 
          password: 'invalid-password-just-testing-connectivity'
        })
      });
      
      const loginData = await loginConnectivityResponse.json();
      
      addResult(
        "Login API Connectivity", 
        TestCategory.AUTH, 
        loginConnectivityResponse.status === 401 || loginConnectivityResponse.status === 400 || loginConnectivityResponse.ok, 
        "Login API endpoint is accessible",
        loginData
      );
      
      // Try login with test credentials (if available)
      try {
        const testLoginResponse = await fetch(`${API_URL}/api/direct-login`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Origin': `https://${DOMAIN}`,
            'Referer': `https://${DOMAIN}`  
          },
          body: JSON.stringify({
            email: 'tester@email.com', 
            password: 'Test123$'
          })
        });
        
        const testLoginData = await testLoginResponse.json();
        
        // Store the token if login successful
        if (testLoginResponse.ok && testLoginData.success && testLoginData.token) {
          authToken = testLoginData.token;
          addResult(
            "Test Account Login", 
            TestCategory.AUTH, 
            true, 
            "Successfully logged in with test account",
            { userId: testLoginData.userId }
          );
        } else {
          addResult(
            "Test Account Login", 
            TestCategory.AUTH, 
            false, 
            "Could not log in with test account (expected if no test account exists)",
            testLoginData
          );
        }
      } catch (testLoginError) {
        addResult(
          "Test Account Login", 
          TestCategory.AUTH, 
          false, 
          `Request failed: ${testLoginError instanceof Error ? testLoginError.message : String(testLoginError)}`
        );
      }
    } catch (loginError) {
      addResult(
        "Login API Connectivity", 
        TestCategory.AUTH, 
        false, 
        `Request failed: ${loginError instanceof Error ? loginError.message : String(loginError)}`
      );
    }
    
    // 7. Test token verification (if we have an auth token)
    if (authToken) {
      console.log('\n7. Testing token verification...');
      try {
        const verifyResponse = await fetch(`${API_URL}/verify`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Origin': `https://${DOMAIN}`,
            'Referer': `https://${DOMAIN}`  
          },
          body: JSON.stringify({ token: authToken })
        });
        
        const verifyData = await verifyResponse.json();
        
        addResult(
          "Token Verification", 
          TestCategory.AUTH, 
          verifyResponse.ok && verifyData.valid, 
          verifyResponse.ok && verifyData.valid 
            ? "Token verified successfully" 
            : "Token verification failed",
          verifyData
        );
      } catch (verifyError) {
        addResult(
          "Token Verification", 
          TestCategory.AUTH, 
          false, 
          `Request failed: ${verifyError instanceof Error ? verifyError.message : String(verifyError)}`
        );
      }
      
      // 8. Test authenticated profile access
      console.log('\n8. Testing authenticated profile access...');
      try {
        const profileResponse = await fetch(`${API_URL}/api/profile`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Origin': `https://${DOMAIN}`,
            'Referer': `https://${DOMAIN}`,
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        const profileData = await profileResponse.json();
        
        addResult(
          "Profile Data Access", 
          TestCategory.PROFILE, 
          profileResponse.ok, 
          profileResponse.ok 
            ? "Successfully retrieved profile data" 
            : `Profile request failed with status ${profileResponse.status}`,
          profileData
        );
        
        // Test profile update with PATCH if profile access succeeded
        if (profileResponse.ok) {
          console.log('\n9. Testing profile update with PATCH...');
          try {
            // Don't change anything significant, just test different field formats
            const updateResponse = await fetch(`${API_URL}/api/profile`, {
              method: 'PATCH',
              headers: { 
                'Content-Type': 'application/json',
                'Origin': `https://${DOMAIN}`,
                'Referer': `https://${DOMAIN}`,
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({
                // Use the same values to avoid actual changes
                name: profileData.user?.name || 'Test User',
                display_name: profileData.user?.displayName || 'Test User',
                bio: profileData.user?.bio || ''
              })
            });
            
            const updateData = await updateResponse.json();
            
            addResult(
              "Profile Update with PATCH", 
              TestCategory.PROFILE, 
              updateResponse.ok, 
              updateResponse.ok 
                ? "Successfully updated profile with PATCH method" 
                : `Profile update failed with status ${updateResponse.status}`,
              updateData
            );
          } catch (updateError) {
            addResult(
              "Profile Update with PATCH", 
              TestCategory.PROFILE, 
              false, 
              `Request failed: ${updateError instanceof Error ? updateError.message : String(updateError)}`
            );
          }
        }
        
        // 9. Test subscription data access
        console.log('\n10. Testing subscription data access...');
        try {
          const subscriptionResponse = await fetch(`${API_URL}/api/subscription`, {
            method: 'GET',
            headers: { 
              'Content-Type': 'application/json',
              'Origin': `https://${DOMAIN}`,
              'Referer': `https://${DOMAIN}`,
              'Authorization': `Bearer ${authToken}`
            }
          });
          
          const subscriptionData = await subscriptionResponse.json();
          
          addResult(
            "Subscription Data Access", 
            TestCategory.SUBSCRIPTION, 
            subscriptionResponse.ok, 
            subscriptionResponse.ok 
              ? "Successfully retrieved subscription data" 
              : `Subscription request failed with status ${subscriptionResponse.status}`,
            subscriptionData
          );
        } catch (subscriptionError) {
          addResult(
            "Subscription Data Access", 
            TestCategory.SUBSCRIPTION, 
            false, 
            `Request failed: ${subscriptionError instanceof Error ? subscriptionError.message : String(subscriptionError)}`
          );
        }
      } catch (profileError) {
        addResult(
          "Profile Data Access", 
          TestCategory.PROFILE, 
          false, 
          `Request failed: ${profileError instanceof Error ? profileError.message : String(profileError)}`
        );
      }
    }
    
    // Generate test summary
    console.log('\n=== TEST SUMMARY ===');
    const totalTests = results.length;
    const passedTests = results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} (${successRate}%)`);
    console.log(`Failed: ${failedTests} (${100 - successRate}%)`);
    
    // Category breakdown
    const categories = Object.values(TestCategory);
    for (const category of categories) {
      const categoryTests = results.filter(r => r.category === category);
      if (categoryTests.length > 0) {
        const categoryPassed = categoryTests.filter(r => r.success).length;
        const categoryRate = Math.round((categoryPassed / categoryTests.length) * 100);
        console.log(`${category}: ${categoryPassed}/${categoryTests.length} (${categoryRate}%)`);
      }
    }
    
    console.log('\nTest complete. Check the results above to verify integration.');
  } catch (error) {
    console.error('Error during test:', error);
  }
  
  return results;
};

// Function to format curl command for documentation/testing
export const getCurlCommands = (): string[] => {
  const commands = [
    // CORS preflight test
    `curl -X OPTIONS ${API_URL}/api/profile -H "Origin: https://${DOMAIN}" -H "Access-Control-Request-Method: GET" -v`,
    
    // Password reset request
    `curl -X POST ${API_URL}/reset -H "Content-Type: application/json" -H "Origin: https://${DOMAIN}" -d '{"email":"${TEST_EMAIL}","resetUrl":"https://${DOMAIN}/reset-password?token="}'`,
    
    // Password reset with token
    `curl -X POST ${API_URL}/api/password-reset -H "Content-Type: application/json" -H "Origin: https://${DOMAIN}" -d '{"token":"your-token-here","password":"${TEST_PASSWORD}","domain":"${DOMAIN}"}'`,
    
    // Test PATCH method
    `curl -X OPTIONS ${API_URL}/api/profile -H "Origin: https://${DOMAIN}" -H "Access-Control-Request-Method: PATCH" -v`,
    
    // Login test (replace with actual credentials for testing)
    `curl -X POST ${API_URL}/api/direct-login -H "Content-Type: application/json" -H "Origin: https://${DOMAIN}" -d '{"email":"tester@email.com","password":"Test123$"}'`,
    
    // Profile PATCH test (replace TOKEN with actual token)
    `curl -X PATCH ${API_URL}/api/profile -H "Content-Type: application/json" -H "Origin: https://${DOMAIN}" -H "Authorization: Bearer TOKEN" -d '{"name":"Test User","display_name":"Test User"}'`
  ];
  
  return commands;
};

// Export test results type
export type { TestResult };
export { TestCategory };

// Run the test when loaded in browser
if (typeof window !== 'undefined') {
  (window as any).runKushTest = testKushIntegration;
  console.log('Test script loaded. Run window.runKushTest() to execute tests.');
}

export default testKushIntegration; 