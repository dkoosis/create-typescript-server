// File: /projects/create-typescript-server/template/src/config.ts

/**
 * Configuration management for the MCP server.
 * This file centralizes all server configuration.
 */

import { LogLevel } from "./utils/logging.js";

/**
 * Server configuration interface
 */
export interface ServerConfig {
  /**
   * Name of the server
   */
  name: string;
  
  /**
   * Server version
   */
  version: string;
  
  /**
   * Whether to run in development mode
   */
  devMode: boolean;
  
  /**
   * Port for the development server
   */
  devPort: number;
  
  /**
   * Minimum log level to display
   */
  logLevel: LogLevel;
}

/**
 * Default configuration values
 */
const defaultConfig: ServerConfig = {
  name: "<%= name %>",
  version: "0.1.0",
  devMode: false,
  devPort: 3333,
  logLevel: "info"
};

/**
 * Get the server configuration, merging defaults with environment variables
 */
export function getConfig(): ServerConfig {
  return {
    ...defaultConfig,
    devMode: process.env.MCP_DEV_MODE === "true" || defaultConfig.devMode,
    devPort: parseInt(process.env.MCP_DEV_PORT || String(defaultConfig.devPort), 10),
    logLevel: (process.env.MCP_LOG_LEVEL as LogLevel) || defaultConfig.logLevel,
  };
}