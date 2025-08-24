/**
 * @fileoverview Main application entry point
 * @module src/index
 * @requires dotenv/config
 * @requires winston
 */

import 'dotenv/config';
import winston from 'winston';

/**
 * Application configuration constants
 * @constant {Object}
 */
const CONFIG = {
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  logLevel: process.env.LOG_LEVEL || 'info',
};

/**
 * Winston logger configuration
 * @type {winston.Logger}
 */
const logger = winston.createLogger({
  level: CONFIG.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

/**
 * Graceful shutdown handler
 * @param {string} signal - The signal received
 * @returns {Promise<void>}
 */
async function handleShutdown(signal) {
  try {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    // Add cleanup logic here (e.g., closing database connections)
    
    logger.info('Cleanup completed. Shutting down...');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

/**
 * Initialize application
 * @returns {Promise<void>}
 * @throws {Error} If initialization fails
 */
async function initializeApp() {
  try {
    logger.info(`Starting application in ${CONFIG.environment} mode`);
    
    // Setup process error handlers
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    // Setup graceful shutdown handlers
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

    // Add initialization logic here (e.g., database connections, server setup)
    
    logger.info(`Application started successfully on port ${CONFIG.port}`);
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    throw error;
  }
}

/**
 * Main execution block
 * Immediately invoked async function to allow top-level await
 */
(async () => {
  try {
    await initializeApp();
  } catch (error) {
    logger.error('Application startup failed:', error);
    process.exit(1);
  }
})();

/**
 * Export configuration and logger for use in other modules
 * @exports {Object} config
 * @exports {winston.Logger} logger
 */
export const config = Object.freeze(CONFIG);
export const log = logger;