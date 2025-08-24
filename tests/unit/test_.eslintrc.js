/**
 * @file tests/unit/test_.eslintrc.js
 * @description Unit tests for ESLint configuration validation
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const { ESLint } = require('eslint');
const chai = require('chai');
const { expect } = chai;

describe('ESLint Configuration Tests', () => {
  let eslintConfig;
  let eslintInstance;

  /**
   * Load the ESLint configuration before running tests
   */
  before(async () => {
    try {
      // Load the actual .eslintrc.js file from project root
      const configPath = path.resolve(__dirname, '../../.eslintrc.js');
      eslintConfig = require(configPath);
      
      // Initialize ESLint instance with loaded config
      eslintInstance = new ESLint({
        useEslintrc: false,
        baseConfig: eslintConfig,
      });
    } catch (error) {
      console.error('Failed to load ESLint configuration:', error);
      throw error;
    }
  });

  describe('Configuration Structure', () => {
    it('should have valid root configuration properties', () => {
      expect(eslintConfig).to.be.an('object');
      expect(eslintConfig.env).to.be.an('object');
      expect(eslintConfig.extends).to.be.an('array');
      expect(eslintConfig.rules).to.be.an('object');
    });

    it('should specify correct environment settings', () => {
      expect(eslintConfig.env).to.include.keys([
        'node',
        'browser',
        'es2024', // Modern JavaScript environment
        'jest',    // Testing environment
      ]);
    });

    it('should have essential extend configurations', () => {
      expect(eslintConfig.extends).to.include.members([
        'eslint:recommended',
        'plugin:security/recommended',
      ]);
    });
  });

  describe('Rules Configuration', () => {
    it('should have critical security rules enabled', () => {
      const securityRules = eslintConfig.rules;
      
      expect(securityRules['no-eval']).to.equal('error');
      expect(securityRules['security/detect-object-injection']).to.equal('error');
      expect(securityRules['security/detect-non-literal-regexp']).to.equal('error');
    });

    it('should have proper code style rules', () => {
      const styleRules = eslintConfig.rules;
      
      expect(styleRules['indent']).to.exist;
      expect(styleRules['quotes']).to.exist;
      expect(styleRules['semi']).to.exist;
    });
  });

  describe('Configuration Validation', () => {
    it('should be a valid ESLint configuration', async () => {
      try {
        const results = await eslintInstance.lintText('const test = true;');
        expect(results).to.be.an('array');
        expect(results[0].messages).to.be.an('array');
      } catch (error) {
        throw new Error(`Invalid ESLint configuration: ${error.message}`);
      }
    });
  });

  describe('Parser Options', () => {
    it('should have correct ECMAScript version', () => {
      expect(eslintConfig.parserOptions).to.be.an('object');
      expect(eslintConfig.parserOptions.ecmaVersion).to.equal(2024);
    });

    it('should enable module source type', () => {
      expect(eslintConfig.parserOptions.sourceType).to.equal('module');
    });
  });

  describe('Plugin Integration', () => {
    it('should have required plugins configured', () => {
      expect(eslintConfig.plugins).to.be.an('array');
      expect(eslintConfig.plugins).to.include.members([
        'security',
        'jest',
      ]);
    });
  });

  /**
   * Test actual file linting against configuration
   */
  describe('Practical Linting Tests', () => {
    const testCases = [
      {
        code: 'const validCode = true;\n',
        expectedErrors: 0,
        description: 'valid code should pass',
      },
      {
        code: 'var invalidVar = "test"',
        expectedErrors: 2, // no-var and missing semicolon
        description: 'should catch var usage and missing semicolon',
      },
    ];

    testCases.forEach(({ code, expectedErrors, description }) => {
      it(description, async () => {
        try {
          const results = await eslintInstance.lintText(code);
          expect(results[0].messages).to.have.lengthOf(expectedErrors);
        } catch (error) {
          throw new Error(`Linting test failed: ${error.message}`);
        }
      });
    });
  });
});

/**
 * Error handler for async operations
 * @param {Function} fn - Async function to execute
 * @returns {Function} Wrapped function with error handling
 */
const asyncErrorHandler = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('Test execution error:', error);
      throw error;
    }
  };
};

// Export for potential use in other test suites
module.exports = {
  asyncErrorHandler,
};