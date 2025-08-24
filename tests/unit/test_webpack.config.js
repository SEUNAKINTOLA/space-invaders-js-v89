/**
 * @file tests/unit/test_webpack.config.js
 * @description Unit tests for webpack configuration
 * @version 1.0.0
 */

const path = require('path');
const { expect } = require('chai');
const webpack = require('webpack');
const webpackConfig = require('../../webpack.config.js');

// Test helpers
const mockEnvironment = (env = {}) => ({
  production: false,
  development: true,
  ...env
});

describe('Webpack Configuration', () => {
  let config;

  beforeEach(() => {
    // Reset config before each test to ensure clean state
    config = typeof webpackConfig === 'function' 
      ? webpackConfig(mockEnvironment())
      : webpackConfig;
  });

  describe('Basic Configuration', () => {
    it('should export a valid webpack configuration object or function', () => {
      expect(webpackConfig).to.exist;
      expect(typeof webpackConfig === 'object' || typeof webpackConfig === 'function')
        .to.be.true;
    });

    it('should have a valid entry point', () => {
      expect(config.entry).to.exist;
      if (typeof config.entry === 'object') {
        Object.values(config.entry).forEach(entry => {
          expect(entry).to.be.a('string').or.be.an('array');
        });
      }
    });

    it('should have a valid output configuration', () => {
      expect(config.output).to.be.an('object');
      expect(config.output.path).to.be.a('string');
      expect(config.output.filename).to.be.a('string');
    });
  });

  describe('Module Rules', () => {
    it('should have module rules defined', () => {
      expect(config.module).to.be.an('object');
      expect(config.module.rules).to.be.an('array').and.not.empty;
    });

    it('should handle JavaScript/TypeScript files', () => {
      const jsRule = config.module.rules.find(rule => 
        rule.test.toString().includes('js') || rule.test.toString().includes('ts')
      );
      expect(jsRule).to.exist;
      expect(jsRule.use).to.exist;
    });

    it('should handle CSS/SCSS files', () => {
      const cssRule = config.module.rules.find(rule =>
        rule.test.toString().includes('css') || rule.test.toString().includes('scss')
      );
      expect(cssRule).to.exist;
    });

    it('should handle asset files', () => {
      const assetRule = config.module.rules.find(rule =>
        rule.test.toString().match(/\.(png|svg|jpg|jpeg|gif)$/)
      );
      expect(assetRule).to.exist;
    });
  });

  describe('Plugins', () => {
    it('should have plugins configured', () => {
      expect(config.plugins).to.be.an('array');
    });

    it('should include essential plugins', () => {
      const hasHtmlPlugin = config.plugins.some(plugin => 
        plugin.constructor.name === 'HtmlWebpackPlugin'
      );
      expect(hasHtmlPlugin).to.be.true;
    });
  });

  describe('Development Settings', () => {
    let devConfig;

    before(() => {
      devConfig = typeof webpackConfig === 'function'
        ? webpackConfig(mockEnvironment({ development: true }))
        : config;
    });

    it('should have appropriate development mode settings', () => {
      expect(devConfig.mode).to.equal('development');
      expect(devConfig.devtool).to.exist;
    });

    it('should configure dev server if present', () => {
      if (devConfig.devServer) {
        expect(devConfig.devServer).to.be.an('object');
        expect(devConfig.devServer.port).to.be.a('number');
        expect(devConfig.devServer.hot).to.be.a('boolean');
      }
    });
  });

  describe('Production Settings', () => {
    let prodConfig;

    before(() => {
      prodConfig = typeof webpackConfig === 'function'
        ? webpackConfig(mockEnvironment({ production: true }))
        : config;
    });

    it('should have appropriate production mode settings', () => {
      if (prodConfig.mode === 'production') {
        expect(prodConfig.optimization).to.exist;
        expect(prodConfig.optimization.minimizer).to.be.an('array');
      }
    });
  });

  describe('Resolve Configuration', () => {
    it('should have proper resolve settings', () => {
      expect(config.resolve).to.be.an('object');
      expect(config.resolve.extensions).to.be.an('array');
    });

    it('should handle module aliases if configured', () => {
      if (config.resolve.alias) {
        expect(config.resolve.alias).to.be.an('object');
      }
    });
  });

  // Error handling tests
  describe('Error Handling', () => {
    it('should handle invalid environment gracefully', () => {
      if (typeof webpackConfig === 'function') {
        expect(() => webpackConfig(null)).to.not.throw();
        expect(() => webpackConfig(undefined)).to.not.throw();
      }
    });
  });
});

/**
 * @typedef {Object} WebpackTestHelpers
 * @property {Function} mockEnvironment - Creates a mock environment object
 */

/**
 * Test helper functions
 * @type {WebpackTestHelpers}
 */
module.exports = {
  mockEnvironment
};