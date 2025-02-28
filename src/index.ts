#!/usr/bin/env node

/**
 * File: src/index.ts
 * 
 * Main entry point for the MCP server.
 * This file sets up the server instance and connects it to the transport.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerHandlers } from "./handlers/index.js";
import { setupDevServer } from "./dev/index.js";
import { getConfig } from "./config.js";
import { setupLogging, log } from "./utils/logging.js";

/**
 * Initialize and start the MCP server
 */
async function main() {
  try {
    const config = getConfig();
    setupLogging(config.logLevel);
    
    // Create MCP server instance
    const server = new Server(
      {
        name: config.name,
        version: config.version,
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      }
    );

    // Register all request handlers
    registerHandlers(server);
    
    // Start development server if in dev mode
    let devServer = null;
    if (config.devMode) {
      devServer = setupDevServer(config.devPort);
    }
    
    // Connect to transport
    const transport = new StdioServerTransport();
    log(`Starting MCP server (${config.devMode ? 'DEV MODE' : 'PRODUCTION MODE'})...`);
    await server.connect(transport);
    log(`MCP server started and ready to receive requests`);
    
    // Set up clean shutdown
    const shutdown = async () => {
      log("Shutting down...");
      
      if (devServer) {
        await new Promise<void>((resolve) => {
          devServer?.close(() => resolve());
        });
      }
      
      process.exit(0);
    };
    
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    
  } catch (error) {
    log(`Failed to start server: ${error}`, 'error');
    process.exit(1);
  }
}

// Handle unexpected errors
process.on("uncaughtException", (error) => {
  log(`Uncaught exception: ${error}`, 'error');
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  log(`Unhandled rejection: ${reason}`, 'error');
  process.exit(1);
});

main().catch((error) => {
  log(`Server error: ${error}`, 'error');
  process.exit(1);
});
