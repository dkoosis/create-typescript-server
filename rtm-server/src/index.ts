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
 *
 * The server includes a development mode with an HTTP interface for
 * direct monitoring and interaction without requiring an MCP client.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { createServer, Server as HttpServer } from "http";
import { parse as parseUrl } from "url";
import { readFileSync, writeFileSync } from "fs";
import { join as joinPath } from "path";

// Import RTM specific modules
import { RTMApiClient } from "./rtm/api-client";
import { checkRTMHealth } from "./rtm/health";
import { RTMConfig } from "./rtm/config";

// Check if running in dev mode (MCP servers typically don't take command line args,
// so we use an environment variable)
const DEV_MODE = process.env.MCP_DEV_MODE === "true";
const DEV_PORT = parseInt(process.env.MCP_DEV_PORT || "3333", 10);

// Initialize RTM client
const rtmClient = new RTMApiClient(RTMConfig.apiKey, RTMConfig.sharedSecret);

/**
 * Custom error class for MCP errors with status codes
 */
class MCPError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number = 400) {
    super(message);
    this.name = "MCPError";
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

// URI schemes
const NOTE_URI_SCHEME = "note:///";
const RTM_URI_SCHEME = "rtm:///";

/**
 * Simple in-memory storage for notes.
 * In a real implementation, this would likely be backed by a database.
 */
const notes: NoteStore = {
  "1": {
    title: "First Note",
    content: "This is note 1",
    createdAt: new Date(),
  },
  "2": {
    title: "Second Note",
    content: "This is note 2",
    createdAt: new Date(),
  },
};

/**
 * Log messages for debugging
 */
const logs: string[] = [];

/**
 * Logs a message with a specified level.
 * @param message - The message to log.
 * @param level - The level of the log message (info, error, debug). Defaults to "info".
 */
function log(
  message: string,
  level: "info" | "error" | "debug" = "info"
): void {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  logs.push(formattedMessage);

  // Only log to console in dev mode or for errors
  if (DEV_MODE || level === "error") {
    console[level === "debug" ? "log" : level](formattedMessage);
  }
}
/**
 * Helper function to validate and extract note ID from URI
 * @param {string} uri - The URI of the note
 * @returns {string} - The extracted note ID
 * @throws {MCPError} - Throws an error if the URI is invalid
 */
function getNoteIdFromUri(uri: string): string {

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

    return url.pathname.replace(/^\//, "");
  } catch (error) {
    if (error instanceof MCPError) {
/**
 * Helper to generate a note URI from an ID.
 * @param {string} id - The ID of the note.
 * @returns {string} - The generated note URI.
 */
function createNoteUri(id: string): string {
  return `${NOTE_URI_SCHEME}${id}`;
}
/**
 * Helper to generate a note URI from an ID
 */
function createNoteUri(id: string): string {
  return `${NOTE_URI_SCHEME}${id}`;
}

/**
 * Create an MCP server with capabilities for resources (to list/read notes),
/**
 * Create an MCP server with capabilities for resources (to list/read notes),
 * tools (to create new notes), and prompts (to summarize notes).
 */
const server = new Server(tes), and prompts (to summarize notes).
 */
const server = new Server(
  {
    name: "Remember The Milk MCP",
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
 * Handler for listing available resources
 * We expose both notes and RTM resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  log("Listing resources");

  // Get the existing notes resources
  const noteResources = Object.entries(notes).map(([id, note]) => ({
    uri: createNoteUri(id),
    mimeType: "text/plain",
    name: note.title,
    description: `A text note: ${
      note.title
    } (Created: ${note.createdAt.toLocaleString()})`,
  }));

  // Add RTM resources
  const rtmResources = [
    {
      uri: "rtm:///health",
      mimeType: "application/json",
      name: "RTM Health Check",
      description: "Health status of the Remember The Milk API connection",
    },
    {
      uri: "rtm:///server/time",
      mimeType: "text/plain",
      name: "RTM Server Time",
      description: "Current server time from Remember The Milk",
    },
  ];

  // Return combined resources
  return {
    resources: [...noteResources, ...rtmResources],
  };
});

/**
 * Handler for reading resources
 * This handles both notes and RTM resources
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  log(`Reading resource: ${request.params.uri}`);
  const uri = request.params.uri;

  // Handle RTM resources
  if (uri.startsWith(RTM_URI_SCHEME)) {
    if (uri === "rtm:///health") {
      const healthStatus = await checkRTMHealth(rtmClient);
      return {
        contents: [
          {
            uri: uri,
            mimeType: "application/json",
            text: JSON.stringify(healthStatus, null, 2),
          },
        ],
      };
    } else if (uri === "rtm:///server/time") {
      try {
        const serverTime = await rtmClient.getTime();
        return {
          contents: [
            {
              uri: uri,
              mimeType: "text/plain",
              text: serverTime,
            },
          ],
        };
      } catch (error) {
        throw new MCPError(
          "resource_error",
          `Failed to get RTM server time: ${error}`,
          500
        );
      }
    }

    throw new MCPError("not_found", `RTM resource not found: ${uri}`, 404);
  }

  // Handle note resources
  const id = getNoteIdFromUri(request.params.uri);
  const note = notes[id];

  if (!note) {
    log(`Note ${id} not found`, "error");
    throw new MCPError("not_found", `Note ${id} not found`, 404);
  }

  return {
    contents: [
      {
        uri: request.params.uri,
        mimeType: "text/plain",
        text: note.content,
      },
    ],
  };
});

/**
 * Handler that lists available tools.
 * We expose both note tools and RTM tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  log("Listing tools");
  return {
    tools: [
      // Note tools
      {
        name: "create_note",
        description: "Create a new note",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Title of the note",
            },
            content: {
              type: "string",
              description: "Text content of the note",
            },
          },
          required: ["title", "content"],
        },
      },
      // RTM tools
      {
        name: "rtm_health_check",
        description:
          "Run a health check on the Remember The Milk API connection",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

/**
 * Handler for tools
 * This handles both note tools and RTM tools.
 * - "create_note": Creates a new note with the provided title and content.
 * - "rtm_health_check": Runs a health check on the Remember The Milk API connection.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  log(`Tool called: ${request.params.name}`);

  // Handle RTM health check tool
  if (request.params.name === "rtm_health_check") {
    const healthStatus = await checkRTMHealth(rtmClient);

    return {
      content: [
        {
          type: "text",
          text: `RTM Health Check: ${
            healthStatus.healthy ? "HEALTHY" : "UNHEALTHY"
          }\n\nDetails:\n${JSON.stringify(healthStatus.details, null, 2)}`,
        },
      ],
    };
  }

  // Handle note creation tool
  if (request.params.name !== "create_note") {
    log(`Unknown tool: ${request.params.name}`, "error");
    throw new MCPError(
      "unknown_tool",
      `Unknown tool: ${request.params.name}`,
      400
    );
  }

  const args = request.params.arguments;

  if (!args) {
    log("Missing required arguments", "error");
    throw new MCPError("missing_arguments", "Missing required arguments", 400);
  }

  const title = args.title;
  const content = args.content;

  if (typeof title !== "string" || !title.trim()) {
    log("Invalid title argument", "error");
    throw new MCPError(
      "invalid_argument",
      "Title is required and must be a non-empty string",
      400
    );
  }

  if (typeof content !== "string" || !content.trim()) {
    log("Invalid content argument", "error");
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
    createdAt: new Date(),
  };

  log(`Created note ${id}: ${title}`);

  return {
    content: [
      {
        type: "text",
        text: `Created note ${id}: ${title}`,
      },
    ],
  };
});

/**
 * Handler that lists available prompts.
 * Exposes a single "summarize_notes" prompt that summarizes all notes.
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  log("Listing prompts");
  return {
    prompts: [
      {
        name: "summarize_notes",
        description: "Summarize all notes",
      },
    ],
  };
});

/**
 * Handler for the summarize_notes prompt.
 * Returns a prompt that requests summarization of all notes, with the notes' contents embedded as resources.
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  log(`Getting prompt: ${request.params.name}`);

  if (request.params.name !== "summarize_notes") {
    log(`Unknown prompt: ${request.params.name}`, "error");
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
      text: note.content,
    },
  }));

  if (embeddedNotes.length === 0) {
    log("No notes found to summarize", "info");
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "There are no notes to summarize. Please create some notes first using the create_note tool.",
          },
        },
      ],
    };
  }

  log(`Returning prompt with ${embeddedNotes.length} notes`);

  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: "Please summarize the following notes:",
        },
      },
      ...embeddedNotes.map((note) => ({
        role: "user" as const,
        content: note,
      })),
      {
        role: "user",
        content: {
          type: "text",
          text: "Provide a concise summary of all the notes above.",
        },
      },
    ],
  };
});

/**
 * HTML for the dashboard - stored as a string to avoid TypeScript errors
 */
const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Remember The Milk MCP - Dev Dashboard</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    .container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .card {
      background: #fff;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      padding: 20px;
      margin-bottom: 20px;
    }
    .notes-list {
      max-height: 400px;
      overflow-y: auto;
    }
    .note-item {
      padding: 10px;
      border-bottom: 1px solid #eee;
      cursor: pointer;
    }
    .note-item:hover {
      background-color: #f9f9f9;
    }
    .selected {
      background-color: #f0f7ff;
    }
    .logs-container {
      background: #f8f9fa;
      border-radius: 5px;
      padding: 15px;
      height: 400px;
      overflow-y: auto;
      font-family: monospace;
      font-size: 14px;
    }
    .log-entry {
      margin-bottom: 5px;
      padding: 5px;
      border-bottom: 1px solid #eee;
    }
    button {
      background-color: #4CAF50;
      color: white;
      border: none;
      padding: 10px 15px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 14px;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background-color: #45a049;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    input, textarea {
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    textarea {
      height: 100px;
      resize: vertical;
    }
    .error {
      color: #d9534f;
      margin-top: 10px;
    }
    .success {
      color: #5cb85c;
      margin-top: 10px;
    }
    .rtm-actions {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Remember The Milk MCP - Development Dashboard</h1>
    <div>
      <span id="status">Server Status: Checking...</span>
    </div>
  </div>

  <div class="container">
    <div>
      <div class="card">
        <h2>Create New Note</h2>
        <form id="createNoteForm">
          <div class="form-group">
            <label for="title">Title</label>
            <input type="text" id="title" name="title" required>
          </div>
          <div class="form-group">
            <label for="content">Content</label>
            <textarea id="content" name="content" required></textarea>
          </div>
          <button type="submit">Create Note</button>
          <div id="formMessage"></div>
        </form>
        
        <div class="rtm-actions">
          <h2>RTM Actions</h2>
          <button id="rtmHealthCheck">Run RTM Health Check</button>
          <div id="rtmHealthResult" style="margin-top: 10px;"></div>
        </div>
      </div>

      <div class="card">
        <h2>Note Details</h2>
        <div id="noteDetails">
          <p>Select a note to view details</p>
        </div>
      </div>
    </div>

    <div>
      <div class="card">
        <h2>Notes</h2>
        <div class="notes-list" id="notesList">
          <p>Loading notes...</p>
        </div>
      </div>

      <div class="card">
        <h2>Logs</h2>
        <div class="logs-container" id="logs">
          <p>Loading logs...</p>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Fetch notes
    async function fetchNotes() {
      try {
        const response = await fetch('/api/notes');
        const notes = await response.json();
        const notesList = document.getElementById('notesList');
        
        if (Object.keys(notes).length === 0) {
          notesList.innerHTML = '<p>No notes found. Create one to get started.</p>';
          return;
        }
        
        notesList.innerHTML = '';
        Object.entries(notes).forEach(([id, note]) => {
          const div = document.createElement('div');
          div.className = 'note-item';
          div.dataset.id = id;
          div.textContent = note.title;
          div.addEventListener('click', () => showNoteDetails(id, note));
          notesList.appendChild(div);
        });
      } catch (error) {
        document.getElementById('notesList').innerHTML = '<p class="error">Failed to load notes</p>';
        console.error(error);
      }
    }

    // Show note details
    function showNoteDetails(id, note) {
      const detailsDiv = document.getElementById('noteDetails');
      
      // Remove selected class from all notes
      document.querySelectorAll('.note-item').forEach(el => el.classList.remove('selected'));
      // Add selected class to current note
      document.querySelector(\`.note-item[data-id="\${id}"]\`).classList.add('selected');
      
      detailsDiv.innerHTML = \`
        <h3>\${note.title}</h3>
        <p><strong>Created:</strong> \${new Date(note.createdAt).toLocaleString()}</p>
        <p><strong>Content:</strong></p>
        <div style="white-space: pre-wrap;">\${note.content}</div>
        <p><strong>URI:</strong> note:///\${id}</p>
      \`;
    }

    // Fetch logs
    async function fetchLogs() {
      try {
        const response = await fetch('/api/logs');
        const logs = await response.json();
        const logsContainer = document.getElementById('logs');
        
        if (logs.length === 0) {
          logsContainer.innerHTML = '<p>No logs yet.</p>';
          return;
        }
        
        logsContainer.innerHTML = logs.map(log => \`<div class="log-entry">\${log}</div>\`).join('');
        logsContainer.scrollTop = logsContainer.scrollHeight;
      } catch (error) {
        document.getElementById('logs').innerHTML = '<p class="error">Failed to load logs</p>';
        console.error(error);
      }
    }

    // Create note form submission
    document.getElementById('createNoteForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formMessage = document.getElementById('formMessage');
      
      try {
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title, content })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create note');
        }
        
        const newNote = await response.json();
        formMessage.className = 'success';
        formMessage.textContent = 'Note created successfully!';
        
        // Reset form
        document.getElementById('title').value = '';
        document.getElementById('content').value = '';
        
        // Refresh notes and logs
        fetchNotes();
        fetchLogs();
        
        // Auto-select the new note
        setTimeout(() => {
          const newNoteElement = document.querySelector(\`.note-item[data-id="\${newNote.id}"]\`);
          if (newNoteElement) {
            newNoteElement.click();
          }
        }, 100);
      } catch (error) {
        formMessage.className = 'error';
        formMessage.textContent = error.message;
        console.error(error);
      }
    });
    
    // RTM Health Check button
    document.getElementById('rtmHealthCheck').addEventListener('click', async () => {
      const resultDiv = document.getElementById('rtmHealthResult');
      resultDiv.innerHTML = '<p>Running health check...</p>';
    
      try {
        const response = await fetch('/api/rtm/health');
        
        if (!response.ok) {
          throw new Error(\`Failed to run health check: \${response.statusText}\`);
        }
        
        const result = await response.json();
        
        if (result.healthy) {
          resultDiv.innerHTML = \`
            <p class="success">✅ RTM API is healthy</p>
            <pre style="font-size: 12px; background: #f5f5f5; padding: 10px;">\${JSON.stringify(result.details, null, 2)}</pre>
          \`;
        } else {
          resultDiv.innerHTML = \`
            <p class="error">❌ RTM API is not healthy</p>
            <pre style="font-size: 12px; background: #f5f5f5; padding: 10px;">\${JSON.stringify(result.details, null, 2)}</pre>
          \`;
        }
      } catch (error) {
        resultDiv.innerHTML = \`<p class="error">Error: \${error.message}</p>\`;
      }
    });

    // Check server status
    async function checkServerStatus() {
      try {
        const response = await fetch('/api/notes');
        if (response.ok) {
          document.getElementById('status').textContent = 'Server Status: Running ✅';
        } else {
          document.getElementById('status').textContent = 'Server Status: Error ❌';
        }
      } catch (error) {
        document.getElementById('status').textContent = 'Server Status: Offline ❌';
      }
    }

    // Auto refresh
    let logsInterval, notesInterval;

    function startPolling() {
      fetchNotes();
      fetchLogs();
      checkServerStatus();
      
      // Refresh logs every 2 seconds
      logsInterval = setInterval(fetchLogs, 2000);
      
      // Refresh notes every 5 seconds
      notesInterval = setInterval(fetchNotes, 5000);
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(logsInterval);
      clearInterval(notesInterval);
    });

    // Initialize
    startPolling();
  </script>
</body>
</html>`;

/**
 * Dev server for direct interaction without an MCP client
 */
function startDevServer(): http.Server {
  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url || "", true);
    const path = parsedUrl.pathname || "/";

    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    try {
      // Dashboard route
      if (path === "/" || path === "/dashboard") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(dashboardHtml);
        return;
      }

      // API routes
      if (path === "/api/notes") {
        if (req.method === "GET") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(notes));
        } else if (req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
          });

          req.on("end", async () => {
            try {
              const data = JSON.parse(body);

              if (!data.title || !data.content) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({ error: "Title and content are required" })
                );
                return;
              }

              const id = String(Object.keys(notes).length + 1);
              notes[id] = {
                title: data.title,
                content: data.content,
                createdAt: new Date(),
              };

              log(`Created note ${id} via dev API: ${data.title}`);

              res.writeHead(201, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ id, ...notes[id] }));
            } catch (err) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Invalid JSON" }));
            }
          });
        } else {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
        }
        return;
      }

      if (path.startsWith("/api/notes/") && req.method === "GET") {
        const id = path.split("/").pop();
        if (id && notes[id]) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ id, ...notes[id] }));
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Note not found" }));
        }
        return;
      }

      // RTM API routes
      if (path === "/api/rtm/health" && req.method === "GET") {
        try {
          const healthStatus = await checkRTMHealth(rtmClient);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(healthStatus));
        } catch (error) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ error: `Failed to check RTM health: ${error}` })
          );
        }
        return;
      }

      if (path === "/api/rtm/time" && req.method === "GET") {
        try {
          const time = await rtmClient.getTime();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ time }));
        } catch (error) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ error: `Failed to get RTM time: ${error}` })
          );
        }
        return;
      }

      if (path === "/api/logs" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(logs));
        return;
      }

      // Default: 404
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
    } catch (error) {
      log(`Dev server error: ${error}`, "error");
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  });

  server.listen(DEV_PORT, () => {
    log(`🔧 Development server running at http://localhost:${DEV_PORT}/`);
    log(`📝 View and manage notes at http://localhost:${DEV_PORT}/dashboard`);
  });

  return server;
}

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  try {
    // Start development server if in dev mode
    let devServer: http.Server | null = null;
    if (DEV_MODE) {
      devServer = startDevServer();
    }

    // Start MCP server
    const transport = new StdioServerTransport();
    log(
      `Starting MCP server (${DEV_MODE ? "DEV MODE" : "PRODUCTION MODE"})...`
    );
    await server.connect(transport);
    log(`MCP server started and ready to receive requests`);

    // Clean shutdown
    const shutdown = async () => {
      log("Shutting down...");

      if (devServer) {
        await new Promise<void>((resolve) => {
          devServer?.close(() => resolve());
        });
      }

      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    log(`Failed to start server: ${error}`, "error");
    process.exit(1);
  }
}

// Handle unexpected errors and shutdown gracefully
process.on("uncaughtException", (error) => {
  log(`Uncaught exception: ${error}`, "error");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  log(`Unhandled rejection: ${reason}`, "error");
  process.exit(1);
});

main().catch((error) => {
  log(`Server error: ${error}`, "error");
  process.exit(1);
});
