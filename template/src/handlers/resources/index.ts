// File: /projects/create-typescript-server/template/src/handlers/resources/index.ts

/**
 * Resource handler registration.
 * This file registers all resource-related handlers with the MCP server.
 * 
 * EXAMPLE CODE: The notes-specific imports and registrations can be removed
 * when implementing your own functionality.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { 
  ListResourcesRequestSchema, 
  ReadResourceRequestSchema 
} from "@modelcontextprotocol/sdk/types.js";
import { registerNotesResourceHandlers } from "./notes.js";
import { log } from "../../utils/logging.js";

/**
 * Register all resource handlers with the server
 */
export function registerResourceHandlers(server: Server): void {
  log("Registering redsource handlers");
  
  // EXAMPLE CODE: Remove this when implementing your own functionality
  registerNotesResourceHandlers(server);
  
  // Add your own resource handler registrations here
  // registerYourResourceHandlers(server);
  
  log("Resource handlers registered");
}