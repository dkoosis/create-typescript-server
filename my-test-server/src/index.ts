#!/usr/bin/env node
// File: create-typescript-server/src/index.ts
// Generated from template: src/index.ts.ejs
// This file was generated using EJS templating.
// To modify this file, edit the template in 'template/src/index.ts.ejs'.

/**
 * This is a template MCP server that implements a simple notes system.
 * It demonstrates core MCP concepts like resources and tools by allowing:
 * - Listing notes as resources
 * - Reading individual notes
 * - Creating new notes via a tool
 * - Summarizing all notes via a prompt
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Custom error class for MCP errors with status codes
 */
class MCPError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number = 400) {
    super(message);
    this.name = 'MCPError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Type definitions for the Note system
 */
interface Note {
  title: string;
  content: string;
  createdAt: Date;
}

type NoteStore = Record<string, Note>;

// URI scheme for notes
const NOTE_URI_SCHEME = "note:///";

/**
 * Simple in-memory storage for notes.
 * In a real implementation, this would likely be backed by a database.
 */
const notes: NoteStore = {
  "1": { 
    title: "First Note", 
    content: "This is note 1",
    createdAt: new Date()
  },
  "2": { 
    title: "Second Note", 
    content: "This is note 2",
    createdAt: new Date()
  }
};

/**
 * Helper function to validate and extract note ID from URI
 */
function getNoteIdFromUri(uri: string): string {
  try {
    const url = new URL(uri);
    
    if (!uri.startsWith(NOTE_URI_SCHEME)) {
      throw new MCPError(
        "invalid_uri",
        `Invalid URI scheme. Expected ${NOTE_URI_SCHEME}`,
        400
      );
    }
    
    return url.pathname.replace(/^\//, '');
  } catch (error) {
    if (error instanceof MCPError) {
      throw error;
    }
    throw new MCPError(
      "invalid_uri", 
      `Invalid URI format: ${uri}`, 
      400
    );
  }
}

/**
 * Helper to generate a note URI from an ID
 */
function createNoteUri(id: string): string {
  return `${NOTE_URI_SCHEME}${id}`;
}

/**
 * Create an MCP server with capabilities for resources (to list/read notes),
 * tools (to create new notes), and prompts (to summarize notes).
 */
const server = new Server(
  {
    name: "my-test-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

/**
 * Handler for listing available notes as resources.
 * Each note is exposed as a resource with:
 * - A note:// URI scheme
 * - Plain text MIME type
 * - Human readable name and description
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: Object.entries(notes).map(([id, note]) => ({
      uri: createNoteUri(id),
      mimeType: "text/plain",
      name: note.title,
      description: `A text note: ${note.title} (Created: ${note.createdAt.toLocaleString()})`,
    }))
  };
});

/**
 * Handler for reading the contents of a specific note.
 * Takes a note:// URI and returns the note content as plain text.
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const id = getNoteIdFromUri(request.params.uri);
  const note = notes[id];

  if (!note) {
    throw new MCPError(
      "not_found",
      `Note ${id} not found`,
      404
    );
  }

  return {
    contents: [{
      uri: request.params.uri,
      mimeType: "text/plain",
      text: note.content
    }]
  };
});

/**
 * Handler that lists available tools.
 * Exposes a single "create_note" tool that lets clients create new notes.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_note",
        description: "Create a new note",
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
      }
    ]
  };
});

/**
 * Handler for the create_note tool.
 * Creates a new note with the provided title and content, and returns success message.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "create_note") {
    throw new MCPError(
      "unknown_tool",
      `Unknown tool: ${request.params.name}`,
      400
    );
  }

  const args = request.params.arguments;
  
  if (!args) {
    throw new MCPError(
      "missing_arguments",
      "Missing required arguments",
      400
    );
  }

  const title = args.title;
  const content = args.content;

  if (typeof title !== "string" || !title.trim()) {
    throw new MCPError(
      "invalid_argument",
      "Title is required and must be a non-empty string",
      400
    );
  }

  if (typeof content !== "string" || !content.trim()) {
    throw new MCPError(
      "invalid_argument",
      "Content is required and must be a non-empty string",
      400
    );
  }

  // Generate a new ID - in production you might want a more robust ID generation method
  const id = String(Object.keys(notes).length + 1);
  
  notes[id] = { 
    title: title.trim(), 
    content: content.trim(),
    createdAt: new Date()
  };

  return {
    content: [{
      type: "text",
      text: `Created note ${id}: ${title}`
    }]
  };
});

/**
 * Handler that lists available prompts.
 * Exposes a single "summarize_notes" prompt that summarizes all notes.
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "summarize_notes",
        description: "Summarize all notes",
      }
    ]
  };
});

/**
 * Handler for the summarize_notes prompt.
 * Returns a prompt that requests summarization of all notes, with the notes' contents embedded as resources.
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  if (request.params.name !== "summarize_notes") {
    throw new MCPError(
      "unknown_prompt",
      `Unknown prompt: ${request.params.name}`,
      400
    );
  }

  const embeddedNotes = Object.entries(notes).map(([id, note]) => ({
    type: "resource" as const,
    resource: {
      uri: createNoteUri(id),
      mimeType: "text/plain",
      text: note.content
    }
  }));

  if (embeddedNotes.length === 0) {
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

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  try {
    const transport = new StdioServerTransport();
    console.log("Starting MCP server...");
    await server.connect(transport);
    console.log("MCP server started and ready to receive requests");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle unexpected errors and shutdown gracefully
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  process.exit(1);
});

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});