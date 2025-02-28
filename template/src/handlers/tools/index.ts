// File: /projects/create-typescript-server/template/src/handlers/tools/index.ts

/**
 * Tool handler registration.
 * This file registers all tool-related handlers with the MCP server.
 * 
 * EXAMPLE CODE: The notes-specific imports and registrations can be removed
 * when implementing your own functionality.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { registerNotesToolHandlers } from "./notes.js";
import { log } from "../../utils/logging.js";

/**
 * Register all tool handlers with the server
 */
export function registerToolHandlers(server: Server): void {
  log("Registering tool handlers");
  
  // Register tools list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    log("Listing available tools");
    
    return {
      tools: [
        // EXAMPLE CODE: Remove this when implementing your own tools
        {
          name: "create_note",
          description: "Create a new text note",
          inputSchema: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Title of the note"
              },
              content: {
                type: "string",
                description: "Text content of the note"
              }
            },
            required: ["title", "content"]
          }
        },
        // Add your own tools here
      ]
    };
  });
  
  // EXAMPLE CODE: Remove this when implementing your own functionality
  registerNotesToolHandlers(server);
  
  // Add your own tool handler registrations here
  // registerYourToolHandlers(server);
  
  log("Tool handlers registered");
}