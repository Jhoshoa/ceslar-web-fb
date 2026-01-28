/**
 * Jest Test Setup
 *
 * This file runs before each test suite.
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.FIREBASE_PROJECT_ID = 'test-project';

// Mock console methods to reduce noise during tests
// Uncomment to suppress logs during testing
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };

// Increase timeout for Firebase operations
jest.setTimeout(10000);

// Clean up after all tests
afterAll(async () => {
  // Clean up any resources if needed
});
