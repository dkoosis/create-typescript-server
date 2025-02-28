#!/bin/bash
# Create modular directory structure for MCP server template

# Create base directory structure
mkdir -p template/src/{handlers/{resources,tools,prompts},services,types,utils,dev}

# Create index.ts files
touch template/src/index.ts
touch template/src/config.ts
touch template/src/handlers/index.ts
touch template/src/handlers/resources/index.ts
touch template/src/handlers/tools/index.ts
touch template/src/handlers/prompts/index.ts
touch template/src/services/index.ts
touch template/src/types/index.ts
touch template/src/utils/index.ts
touch template/src/dev/index.ts

# Create example implementation files
touch template/src/types/notes.ts
touch template/src/services/notes.ts
touch template/src/handlers/resources/notes.ts
touch template/src/handlers/tools/notes.ts
touch template/src/handlers/prompts/notes.ts

# Create utility files
touch template/src/utils/errors.ts
touch template/src/utils/logging.ts
touch template/src/dev/dashboard.ts

# Create TypeScript tooling configuration files
touch template/{.eslintrc.json,.prettierrc,.vscode/settings.json,jest.config.js,typedoc.json}

echo "Directory structure created successfully"