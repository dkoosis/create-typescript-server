// File: /projects/create-typescript-server/template/src/dev/dashboard.ts

/**
 * Dashboard HTML template for the development server.
 * Provides a web interface for testing the MCP server without an MCP client.
 */

export const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= name %> - Dev Dashboard</title>
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
  </style>
</head>
<body>
  <div class="header">
    <h1><%= name %> - Development Dashboard</h1>
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