/**
 * @file .eslintrc.js
 * @description ESLint configuration for production-grade JavaScript projects
 * @version 1.0.0
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2024: true, // Latest ECMAScript features
    jest: true, // For testing environments
  },
  
  // Use the latest JavaScript features and React
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },

  // Extend recommended configurations
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:jest/recommended',
    'plugin:security/recommended',
    'plugin:prettier/recommended',
    'plugin:sonarjs/recommended',
  ],

  // Additional plugins for enhanced linting
  plugins: [
    'import',
    'jest',
    'security',
    'prettier',
    'sonarjs',
    'promise',
    'n',
  ],

  // Custom rules configuration
  rules: {
    // Error Prevention
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-use-before-define': ['error', { functions: false, classes: true }],
    
    // Best Practices
    'complexity': ['error', { max: 10 }], // Limit cyclomatic complexity
    'max-lines-per-function': ['error', { max: 50 }],
    'max-depth': ['error', { max: 4 }],
    'sonarjs/cognitive-complexity': ['error', 15],
    
    // Modern JavaScript
    'prefer-const': 'error',
    'prefer-destructuring': 'error',
    'prefer-template': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    
    // Imports
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index',
      ],
      'newlines-between': 'always',
      'alphabetize': { order: 'asc' }
    }],
    'import/no-unresolved': 'error',
    
    // Promises
    'promise/always-return': 'error',
    'promise/no-return-wrap': 'error',
    'promise/param-names': 'error',
    'promise/catch-or-return': 'error',
    
    // Security
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-unsafe-regex': 'error',
    
    // Node.js specific
    'n/no-deprecated-api': 'error',
    'n/no-missing-require': 'error',
    'n/no-unpublished-require': 'error',
  },

  // Settings for import resolution
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },

  // Ignore patterns
  ignorePatterns: [
    'dist/',
    'build/',
    'coverage/',
    'node_modules/',
    '*.min.js',
    '*.test.js',
  ],

  // Override configurations for specific files
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      rules: {
        'max-lines-per-function': 'off',
        'no-unused-expressions': 'off',
      },
    },
    {
      files: ['scripts/**/*.js'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};