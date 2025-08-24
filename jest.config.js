/**
 * @file jest.config.js
 * @description Jest configuration file for the project's test environment
 * @version 1.0.0
 */

module.exports = {
  // Basic Configuration
  verbose: true,
  testEnvironment: 'node',
  rootDir: '.',

  // Code Coverage Configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Test Pattern Configuration
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/.git/',
  ],

  // Module Resolution Configuration
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
  moduleNameMapper: {
    // Add module name mappings for aliases if needed
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Transform Configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // Setup and Teardown Configuration
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  globalSetup: '<rootDir>/jest.global-setup.js',
  globalTeardown: '<rootDir>/jest.global-teardown.js',

  // Performance and Debug Configuration
  maxWorkers: '50%', // Limit parallel test execution
  bail: 1, // Stop running tests after first failure
  detectOpenHandles: true,
  forceExit: true,

  // Snapshot Configuration
  snapshotSerializers: [],
  snapshotFormat: {
    printBasicPrototype: false,
  },

  // Reporter Configuration
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './reports/junit',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
  ],

  // Timing Configuration
  testTimeout: 10000, // 10 seconds
  slowTestThreshold: 5000, // 5 seconds

  // Error Handling Configuration
  errorOnDeprecated: true,
  
  // Custom Environment Variables
  testEnvironmentOptions: {
    url: 'http://localhost',
  },

  // Watch Configuration
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],

  // Clear Mock Configuration
  clearMocks: true,
  resetMocks: false,
  restoreMocks: true,
};