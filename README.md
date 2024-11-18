# create-typescript-server

A command line tool for quickly scaffolding new MCP (Model Context Protocol) servers.

## Getting Started

```bash
# Create a new server in the current directory
npx @modelcontextprotocol/create-server

# Or specify a directory
npx @modelcontextprotocol/create-server my-server

# With options
npx @modelcontextprotocol/create-server my-server --name "My MCP Server" --description "A custom MCP server"
```

After creating your server:

```bash
cd my-server     # Navigate to server directory
npm install      # Install dependencies
npm run watch    # Start TypeScript compiler in watch mode
npm link         # Make your server binary globally available (optional)
```

## License

This project is licensed under the MIT License—see the [LICENSE](LICENSE) file for details.
