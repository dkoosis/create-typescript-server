// File: /projects/create-typescript-server/template/src/utils/index.ts

/**
 * Utility functions for the MCP server.
 * This file provides common utilities used throughout the application.
 */

// URI constants
export const NOTE_URI_SCHEME = "note:///";

/**
 * Validates and extracts a note ID from a note URI
 * 
 * @param uri The note URI to parse
 * @returns The extracted note ID
 * @throws {MCPError} If the URI is invalid
 */
export function getNoteIdFromUri(uri: string): string {
  try {
    const url = new URL(uri);
    
    if (!uri.startsWith(NOTE_URI_SCHEME)) {
      throw new Error(`Invalid URI scheme. Expected ${NOTE_URI_SCHEME}`);
    }
    
    return url.pathname.replace(/^\//, '');
  } catch (error) {
    throw new Error(`Invalid URI format: ${uri}`);
  }
}

/**
 * Creates a note URI from a note ID
 * 
 * @param id The note ID
 * @returns A properly formatted note URI
 */
export function createNoteUri(id: string): string {
  return `${NOTE_URI_SCHEME}${id}`;
}

// Re-export commonly used utilities
export { log } from './logging.js';