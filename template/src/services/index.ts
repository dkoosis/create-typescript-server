// File: /projects/create-typescript-server/template/src/services/notes.ts

/**
 * EXAMPLE CODE - Notes Service
 * 
 * This file contains the service layer for the notes functionality.
 * It provides the business logic for creating, reading, and managing notes.
 * 
 * When building your actual service:
 * - Remove this file completely OR
 * - Use it as a template, replacing notes functionality with your own domain
 */

import { Note } from "../types/notes.js";
import { log } from "../utils/logging.js";

/**
 * Simple in-memory store for notes
 * In a real application, this would likely be backed by a database
 */
const noteStore: Record<string, Note> = {
  "1": { 
    id: "1",
    title: "First Note", 
    content: "This is note 1",
    createdAt: new Date()
  },
  "2": { 
    id: "2",
    title: "Second Note", 
    content: "This is note 2",
    createdAt: new Date()
  }
};

/**
 * Notes service provides methods for working with notes
 */
class NotesService {
  /**
   * Get all notes in the store
   */
  public getAllNotes(): Note[] {
    return Object.values(noteStore);
  }
  
  /**
   * Get a note by its ID
   */
  public getNoteById(id: string): Note | null {
    return noteStore[id] || null;
  }
  
  /**
   * Create a new note
   */
  public createNote(title: string, content: string): Note {
    // Generate a simple ID (in real apps, use a more robust ID generation)
    const id = String(Object.keys(noteStore).length + 1);
    
    const note: Note = {
      id,
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date()
    };
    
    noteStore[id] = note;
    log(`Created note ${id}: ${title}`);
    
    return note;
  }
}

// Export a singleton instance
export const notesService = new NotesService();