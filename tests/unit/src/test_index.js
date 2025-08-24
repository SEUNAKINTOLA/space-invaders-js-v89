/**
 * @fileoverview Unit tests for src/index.js
 * @jest-environment node
 */

// Import test subjects
import { 
  initializeApp,
  configureEnvironment,
  setupMiddleware,
  createServer
} from '../../src/index.js';

// Mock external dependencies
jest.mock('express', () => {
  return jest.fn(() => ({
    use: jest.fn(),
    listen: jest.fn()
  }));
});

describe('Application Initialization Tests', () => {
  let originalEnv;

  // Setup before each test
  beforeEach(() => {
    // Store original environment
    originalEnv = process.env;
    process.env = { ...process.env };
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  // Cleanup after each test
  afterEach(() => {
    process.env = originalEnv;
  });

  describe('initializeApp()', () => {
    it('should initialize the application successfully', async () => {
      const result = await initializeApp();
      
      expect(result).toBeDefined();
      expect(result.status).toBe('success');
    });

    it('should handle initialization errors gracefully', async () => {
      // Simulate an error condition
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const mockError = new Error('Initialization failed');
      jest.spyOn(global, 'Promise').mockRejectedValueOnce(mockError);

      await expect(initializeApp()).rejects.toThrow('Initialization failed');
    });
  });

  describe('configureEnvironment()', () => {
    it('should load environment variables correctly', () => {
      process.env.NODE_ENV = 'test';
      
      const config = configureEnvironment();
      
      expect(config).toHaveProperty('environment', 'test');
      expect(config).toHaveProperty('isProduction', false);
    });

    it('should provide default values for missing environment variables', () => {
      delete process.env.NODE_ENV;
      
      const config = configureEnvironment();
      
      expect(config).toHaveProperty('environment', 'development');
    });
  });

  describe('setupMiddleware()', () => {
    it('should configure all required middleware', () => {
      const mockApp = {
        use: jest.fn()
      };

      setupMiddleware(mockApp);

      expect(mockApp.use).toHaveBeenCalled();
    });

    it('should handle middleware setup errors', () => {
      const mockApp = {
        use: jest.fn().mockImplementation(() => {
          throw new Error('Middleware setup failed');
        })
      };

      expect(() => setupMiddleware(mockApp)).toThrow('Middleware setup failed');
    });
  });

  describe('createServer()', () => {
    it('should create and configure server instance', async () => {
      const server = await createServer();
      
      expect(server).toBeDefined();
      expect(server).toHaveProperty('listen');
    });

    it('should handle server creation errors', async () => {
      // Simulate server creation error
      jest.spyOn(global, 'Promise').mockRejectedValueOnce(
        new Error('Server creation failed')
      );

      await expect(createServer()).rejects.toThrow('Server creation failed');
    });
  });

  describe('Integration Tests', () => {
    it('should successfully complete the full initialization flow', async () => {
      const app = await initializeApp();
      const config = configureEnvironment();
      const server = await createServer();

      expect(app).toBeDefined();
      expect(config).toBeDefined();
      expect(server).toBeDefined();
    });
  });
});

/**
 * Test Utilities
 */
const createMockRequest = () => ({
  headers: {},
  body: {},
  params: {},
  query: {}
});

const createMockResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis()
});

/**
 * Custom test matchers
 */
expect.extend({
  toBeSuccessfulResponse(received) {
    const pass = received && 
                received.status === 'success' && 
                received.data !== undefined;
    
    return {
      pass,
      message: () => 
        pass
          ? 'Expected response not to be successful'
          : 'Expected response to be successful'
    };
  }
});