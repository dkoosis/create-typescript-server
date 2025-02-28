// File: /projects/create-typescript-server/template/src/handlers/prompts/notes.ts

/**
 * EXAMPLE CODE - Notes Prompt Handlers
 * 
 * This file contains example prompt handlers for the notes functionality.
 * It demonstrates how to implement prompt handlers for a simple domain.
 * 
 * When building your actual service:
 * - Remove this file completely OR
 * - Use it as a template, replacing notes functionality with your own domain
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { GetPromptRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { notesService } from "../../services/notes.js";
import { createNoteUri } from "../../utils/index.js";
import { MCPError, ErrorCode } from "../../utils/errors.js";
import { log } from "../../utils/logging.js";

/**
 * Register all notes-related prompt handlers
 */
export function registerNotesPromptHandlers(server: Server): void {
  log("Registering notes prompt handlers");
  
  // Handler for the summarize_notes prompt
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    if (request.params.name !== "summarize_notes") {
      return; // Let other handlers process different prompts
    }
    
    log(`Prompt requested: ${request.params.name}`);
    
    const notes = notesService.getAllNotes();
    
    const embeddedNotes = notes.map(note => ({
      type: "resource" as const,
      resource: {
        uri: createNoteUri(note.id),
        mimeType: "text/plain",
        text: note.content
      }
    }));

    if (embeddedNotes.length === 0) {
      log("No notes found to summarize", 'info');
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "There are no notes to summarize. Please create some notes first using the create_note tool."
            }
          }
        ]
      };
    }

    log(`Returning prompt with ${embeddedNotes.length} notes`);
    
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "Please summarize the following notes:"
          }
        },
        ...embeddedNotes.map(note => ({
          role: "user" as const,
          content: note
        })),
        {
          role: "user",
          content: {
            type: "text",
            text: "Provide a concise summary of all the notes above."
          }
        }
      ]
    };
  });
}