// File: /projects/create-typescript-server/template/src/handlers/tools/notes.ts

/**
 * EXAMPLE CODE - Notes Tool Handlers
 * 
 * This file contains example tool handlers for the notes functionality.
 * It demonstrates how to implement tool handlers for a simple domain.
 * 
 * When building your actual service:
 * - Remove this file completely OR
 * - Use it as a template, replacing notes functionality with your own domain
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { notesService } from "../../services/notes.js";
import { MCPError, ErrorCode } from "../../utils/errors.js";
import { log } from "../../utils/logging.js";

/**
 * Register all notes-related tool handlers
 */
export function registerNotesToolHandlers(server: Server): void {
  log("Registering notes tool handlers");
  
  // Handler for the create_note tool
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== "create_note") {
      return; // Let other handlers process different tools
    }
    
    log(`Tool called: ${request.params.name}`);
    
    const args = request.params.arguments;
    
    if (!args) {
      throw new MCPError(
        ErrorCode.MISSING_ARGUMENT,
        "Missing required arguments",
        400
      );
    }

    const title = args.title;
    const content = args.content;

    if (typeof title !== "string" || !title.trim()) {
      throw new MCPError(
        ErrorCode.INVALID_ARGUMENT,
        "Title is required and must be a non-empty string",
        400
      );
    }

    if (typeof content !== "string" || !content.trim()) {
      throw new MCPError(
        ErrorCode.INVALID_ARGUMENT,
        "Content is required and must be a non-empty string",
        400
      );
    }

    try {
      const note = notesService.createNote(title, content);
      
      return {
        content: [{
          type: "text",
          text: `Created note ${note.id}: ${note.title}`
        }]
      };
    } catch (error) {
      throw new MCPError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to create note: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  });
}