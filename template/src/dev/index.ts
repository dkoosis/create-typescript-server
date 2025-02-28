// File: /projects/create-typescript-server/template/src/dev/index.ts

/**
 * Development server for the MCP server.
 * Provides an HTTP interface for direct interaction without requiring an MCP client.
 */

import * as http from "http";
import * as url from "url";
import { Server } from "http";
import { log, getLogs } from "../utils/logging.js";
import { dashboardHtml } from "./dashboard.js";

// Import data services for the dev server
import { notesService } from "../services/notes.js";

/**
 * Start the development server
 * 
 * @param port The port to listen on
 * @returns An HTTP server instance
 */
export function setupDevServer(port: number): Server {
  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url || '', true);
    const path = parsedUrl.pathname || '/';
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    try {
      // Dashboard route
      if (path === '/' || path === '/dashboard') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(dashboardHtml);
        return;
      }
      
      // API routes
      if (path === '/api/notes') {
        if (req.method === 'GET') {
          // Get all notes
          const notes = notesService.getAllNotes();
          const notesMap = notes.reduce((acc, note) => {
            acc[note.id] = note;
            return acc;
          }, {} as Record<string, any>);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(notesMap));
        } else if (req.method === 'POST') {
          // Create a new note
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              
              if (!data.title || !data.content) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Title and content are required' }));
                return;
              }
              
              const note = notesService.createNote(data.title, data.content);
              
              res.writeHead(201, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(note));
            } catch (err) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
        } else {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Method not allowed' }));
        }
        return;
      }
      
      if (path.startsWith('/api/notes/') && req.method === 'GET') {
        // Get a specific note
        const id = path.split('/').pop();
        const note = id ? notesService.getNoteById(id) : null;
        
        if (note) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(note));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Note not found' }));
        }
        return;
      }
      
      if (path === '/api/logs' && req.method === 'GET') {
        // Get all logs
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(getLogs()));
        return;
      }
      
      // Default: 404
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
      
    } catch (error) {
      log(`Dev server error: ${error}`, 'error');
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });
  
  server.listen(port, () => {
    log(`🔧 Development server running at http://localhost:${port}/`);
    log(`📝 View and manage notes at http://localhost:${port}/dashboard`);
  });
  
  return server;
}