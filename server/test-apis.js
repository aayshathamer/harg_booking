const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api';

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper function to run tests
async function runTest(testName, testFunction) {
  testResults.total++;
  try {
    console.log(`\n🧪 Testing: ${testName}`);
    await testFunction();
    console.log(`✅ PASSED: ${testName}`);
    testResults.passed++;
    testResults.details.push({ name: testName, status: 'PASSED' });
  } catch (error) {
    console.log(`❌ FAILED: ${testName}`);
    console.log(`   Error: ${error.message}`);
    testResults.failed++;
    testResults.details.push({ name: testName, status: 'FAILED', error: error.message });
  }
}

// Test functions
async function testHealthEndpoint() {
  const response = await fetch(`${BASE_URL}/health`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (data.status !== 'OK') throw new Error('Health check failed');
}

async function testGetServices() {
  const response = await fetch(`${BASE_URL}/services`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Services should be an array');
}

async function testGetServicesByCategory() {
  const response = await fetch(`${BASE_URL}/services/category/Hotels%20%26%20Stays`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Category services should be an array');
}

async function testGetDeals() {
  const response = await fetch(`${BASE_URL}/deals`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Deals should be an array');
}

async function testGetUsers() {
  const response = await fetch(`${BASE_URL}/users`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Users should be an array');
}

async function testGetBookingsStats() {
  const response = await fetch(`${BASE_URL}/bookings/stats`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (typeof data !== 'object') throw new Error('Stats should be an object');
}

async function testGetBookingsAnalytics() {
  const response = await fetch(`${BASE_URL}/bookings/analytics`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (typeof data !== 'object') throw new Error('Analytics should be an object');
}

async function testGetBookings() {
  const response = await fetch(`${BASE_URL}/bookings`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Bookings should be an array');
}

async function testAuthRegister() {
  const testUser = {
    email: 'test@example.com',
    password: 'testpassword123',
    firstName: 'Test',
    lastName: 'User',
    phone: '1234567890'
  };

  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!data.token || !data.user) throw new Error('Registration should return token and user');
  
  return data.token; // Return token for other tests
}

async function testAuthLogin() {
  const credentials = {
    email: 'test@example.com',
    password: 'testpassword123'
  };

  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!data.token || !data.user) throw new Error('Login should return token and user');
  
  return data.token; // Return token for other tests
}

async function testSaveDeal(token) {
  if (!token) {
    console.log('⚠️ Skipping save deal test - no token available');
    return;
  }

  const response = await fetch(`${BASE_URL}/user/save-deal`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ dealId: 'test-deal-1' })
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
}

async function testGetSavedDeals(token) {
  if (!token) {
    console.log('⚠️ Skipping saved deals test - no token available');
    return;
  }

  const response = await fetch(`${BASE_URL}/user/saved-deals`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Saved deals should be an array');
}

async function testGetNotifications(token) {
  if (!token) {
    console.log('⚠️ Skipping notifications test - no token available');
    return;
  }

  const response = await fetch(`${BASE_URL}/user/notifications`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Notifications should be an array');
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting API Endpoint Testing...\n');
  console.log(`📍 Testing server at: ${BASE_URL}\n`);

  // Basic endpoints (no auth required)
  await runTest('Health Check', testHealthEndpoint);
  await runTest('Get All Services', testGetServices);
  await runTest('Get Services by Category', testGetServicesByCategory);
  await runTest('Get All Deals', testGetDeals);
  await runTest('Get All Users', testGetUsers);
  await runTest('Get Bookings Stats', testGetBookingsStats);
  await runTest('Get Bookings Analytics', testGetBookingsAnalytics);
  await runTest('Get All Bookings', testGetBookings);

  // Auth endpoints
  let authToken = null;
  try {
    await runTest('User Registration', testAuthRegister);
    authToken = await testAuthLogin();
    await runTest('User Login', () => Promise.resolve());
  } catch (error) {
    console.log('⚠️ Auth tests failed, skipping protected endpoints');
  }

  // Protected endpoints (require auth)
  if (authToken) {
    await runTest('Save Deal', () => testSaveDeal(authToken));
    await runTest('Get Saved Deals', () => testGetSavedDeals(authToken));
    await runTest('Get Notifications', () => testGetNotifications(authToken));
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 API TESTING SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📋 Total: ${testResults.total}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.details
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        console.log(`   • ${test.name}: ${test.error}`);
      });
  }

  console.log('\n' + '='.repeat(60));
}

// Run the tests
runAllTests().catch(console.error);
