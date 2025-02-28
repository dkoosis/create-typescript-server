// File: /projects/create-typescript-server/template/src/handlers/prompts/index.ts

/**
 * Prompt handler registration.
 * This file registers all prompt-related handlers with the MCP server.
 * 
 * EXAMPLE CODE: The notes-specific imports and registrations can be removed
 * when implementing your own functionality.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListPromptsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { registerNotesPromptHandlers } from "./notes.js";
import { log } from "../../utils/logging.js";

/**
 * Register all prompt handlers with the server
 */
export function registerPromptHandlers(server: Server): void {
  log("Registering prompt handlers");
  
  // Register prompts list handler
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    log("Listing available prompts");
    
    return {
      prompts: [
        // EXAMPLE CODE: Remove this when implementing your own prompts
        {
          name: "summarize_notes",
          description: "Summarize all notes in the system"
        },
        // Add your own prompts here
      ]
    };
  });
  
  // EXAMPLE CODE: Remove this when implementing your own functionality
  registerNotesPromptHandlers(server);
  
  // Add your own prompt handler registrations here
  // registerYourPromptHandlers(server);
  
  log("Prompt handlers registered");
}