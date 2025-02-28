// File: /projects/create-typescript-server/template/src/types/notes.ts

/**
 * EXAMPLE CODE - Notes Types
 * 
 * This file contains type definitions for the notes functionality.
 * 
 * When building your actual service:
 * - Remove this file completely OR
 * - Use it as a template, replacing notes types with your own domain types
 */

/**
 * Represents a text note in the system
 */
export interface Note {
    /**
     * Unique identifier for the note
     */
    id: string;
    
    /**
     * Title of the note
     */
    title: string;
    
    /**
     * Text content of the note
     */
    content: string;
    
    /**
     * Date when the note was created
     */
    createdAt: Date;
  }