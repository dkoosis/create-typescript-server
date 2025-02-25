#!/usr/bin/env node
// File: create-typescript-server/src/index.ts
// Purpose: Main entry point for the MCP server creation CLI tool

import chalk from "chalk";
import { Command } from "commander";
import ejs from "ejs";
import fs from "fs/promises";
import inquirer from "inquirer";
import ora from "ora";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Options for creating a new MCP server
 * @interface CreateServerOptions
 * @property {string} [name] - The name of the server (optional in CLI, prompted if not provided)
 * @property {string} [description] - The description of the server (optional in CLI, prompted if not provided)
 */
interface CreateServerOptions {
  name?: string;
  description?: string;
}

/**
 * Determines the appropriate configuration directory for Claude based on the operating system
 * @returns {string} Path to the Claude configuration directory
 * @throws {Error} If the operating system is not supported or environment variables are missing
 */
function getClaudeConfigDir(): string {
  switch (os.platform()) {
    case "darwin":
      return path.join(
        os.homedir(),
        "Library",
        "Application Support",
        "Claude",
      );
    case "win32":
      if (!process.env.APPDATA) {
        throw new Error("APPDATA environment variable is not set");
      }
      return path.join(process.env.APPDATA, "Claude");
    default:
      throw new Error(
        `Unsupported operating system for Claude configuration: ${os.platform()}`,
      );
  }
}

/**
 * Updates the Claude configuration to include the newly created MCP server
 * @param {string} name - The name of the MCP server to register
 * @param {string} directory - The directory where the server is created
 * @returns {Promise<void>}
 */
async function updateClaudeConfig(name: string, directory: string): Promise<void> {
  try {
    const configFile = path.join(
      getClaudeConfigDir(),
      "claude_desktop_config.json",
    );

    let config;
    try {
      config = JSON.parse(await fs.readFile(configFile, "utf-8"));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
        throw err;
      }

      // File doesn't exist, create initial config
      config = {};
      await fs.mkdir(path.dirname(configFile), { recursive: true });
    }

    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    if (config.mcpServers[name]) {
      const { replace } = await inquirer.prompt([
        {
          type: "confirm",
          name: "replace",
          message: `An MCP server named "${name}" is already configured for Claude.app. Do you want to replace it?`,
          default: false,
        },
      ]);
      if (!replace) {
        console.log(
          chalk.yellow(
            `Skipped replacing Claude.app config for existing MCP server "${name}"`,
          ),
        );
        return;
      }
    }
    config.mcpServers[name] = {
      command: "node",
      args: [path.resolve(directory, "build", "index.js")],
    };

    await fs.writeFile(configFile, JSON.stringify(config, null, 2));
    console.log(
      chalk.green("✓ Successfully added MCP server to Claude.app configuration"),
    );
  } catch {
    console.log(chalk.yellow("Note: Could not update Claude.app configuration"));
  }
}

/**
 * Creates a new MCP server in the specified directory
 * 
 * This function:
 * 1. Validates the target directory
 * 2. Prompts for any missing configuration options
 * 3. Creates the server directory structure
 * 4. Processes template files, adding path information and generation details
 * 5. Configures the server for use with Claude.app if requested
 * 
 * @param {string} directory - The target directory to create the server in
 * @param {CreateServerOptions} options - Configuration options for the server
 * @returns {Promise<void>}
 */
async function createServer(directory: string, options: CreateServerOptions = {}): Promise<void> {
  // Check if directory already exists
  try {
    await fs.access(directory);
    console.log(chalk.red(`Error: Directory '${directory}' already exists.`));
    process.exit(1);
  } catch (err) {
    // Directory doesn't exist, we can proceed
  }

  const questions = [
    {
      type: "input",
      name: "name",
      message: "What is the name of your MCP server?",
      default: path.basename(directory),
      when: !options.name,
    },
    {
      type: "input",
      name: "description",
      message: "What is the description of your server?",
      default: "A Model Context Protocol server",
      when: !options.description,
    },
    {
      type: "confirm",
      name: "installForClaude",
      message: "Would you like to install this server for Claude.app?",
      default: true,
      when: os.platform() === "darwin" || os.platform() === "win32",
    },
  ];

  const answers = await inquirer.prompt(questions);

  const config = {
    name: options.name || answers.name,
    description: options.description || answers.description,
  };

  const spinner = ora("Creating MCP server...").start();

  try {
    // Create project directory
    await fs.mkdir(directory);

    // Copy template files
    const templateDir = path.join(__dirname, "../template");
    const files = await fs.readdir(templateDir, { recursive: true });

    // Create files from templates
    const createFilePromises = files.map(async (file) => {
      const sourcePath = path.join(templateDir, file);
      const stats = await fs.stat(sourcePath);

      if (!stats.isFile()) return;

      // Special handling for dot files - remove the leading dot from template name
      const targetPath = path.join(
        directory,
        file.startsWith('dotfile-')
        ? `.${file.slice(8).replace('.ejs', '')}`
        : file.replace('.ejs', '')
      );

      // Get relative path for the file header
      const relativePath = targetPath.replace(directory + path.sep, '');
      
      // Read the source content
      const sourceContent = await fs.readFile(sourcePath, "utf-8");
      
      // Handle differently based on file type
      const ext = path.extname(targetPath.replace('.ejs', '')).toLowerCase();
      const isJson = ext === '.json';
      const isMarkdown = ext === '.md';
      
      // Process the file based on its type
      let content = '';
      let hasShebang = false;
      
      // Check if content has a shebang line
      if (sourceContent.startsWith('#!')) {
        hasShebang = true;
      }
      
      if (file.endsWith('.ejs')) {
        // For EJS templates, render them first
        content = ejs.render(sourceContent, config);
        
        // For JSON files, we can't add comments - they need to be valid JSON
        if (!isJson && !hasShebang) {
          // Determine the appropriate comment style
          const commentPrefix = isMarkdown ? '<!-- ' : '// ';
          const commentSuffix = isMarkdown ? ' -->' : '';
          
          // Add header with appropriate comment style
          const header = [
            `${commentPrefix}File: create-typescript-server/${relativePath}${commentSuffix}`,
            `${commentPrefix}Generated from template: ${file}${commentSuffix}`,
            `${commentPrefix}This file was generated using EJS templating.${commentSuffix}`,
            `${commentPrefix}To modify this file, edit the template in 'template/${file}'.${commentSuffix}`,
            '' // Empty line for spacing
          ].join('\n');
          
          content = header + content;
        } else if (hasShebang) {
          // For files with shebang, preserve the shebang at the first line
          const lines = content.split('\n');
          const shebangLine = lines[0];
          const restOfContent = lines.slice(1).join('\n');
          
          // Determine the appropriate comment style
          const commentPrefix = '// ';
          const commentSuffix = '';
          
          // Add header with appropriate comment style after the shebang
          const header = [
            `${commentPrefix}File: create-typescript-server/${relativePath}${commentSuffix}`,
            `${commentPrefix}Generated from template: ${file}${commentSuffix}`,
            `${commentPrefix}This file was generated using EJS templating.${commentSuffix}`,
            `${commentPrefix}To modify this file, edit the template in 'template/${file}'.${commentSuffix}`,
            '' // Empty line for spacing
          ].join('\n');
          
          content = shebangLine + '\n' + header + restOfContent;
        }
      } else {
        // For direct copies
        content = sourceContent;
        
        // Don't add headers to JSON files or files with shebangs that aren't templates
        if (!isJson && !hasShebang) {
          // Determine the appropriate comment style
          const commentPrefix = isMarkdown ? '<!-- ' : '// ';
          const commentSuffix = isMarkdown ? ' -->' : '';
          
          // Add header with appropriate comment style
          const header = [
            `${commentPrefix}File: create-typescript-server/${relativePath}${commentSuffix}`,
            `${commentPrefix}Copied from template: ${file}${commentSuffix}`,
            `${commentPrefix}This file was copied directly from the template.${commentSuffix}`,
            `${commentPrefix}To modify this file, edit the template in 'template/${file}'.${commentSuffix}`,
            '' // Empty line for spacing
          ].join('\n');
          
          content = header + content;
        } else if (hasShebang) {
          // For files with shebang, preserve the shebang at the first line
          const lines = content.split('\n');
          const shebangLine = lines[0];
          const restOfContent = lines.slice(1).join('\n');
          
          // Determine the appropriate comment style
          const commentPrefix = '// ';
          const commentSuffix = '';
          
          // Add header with appropriate comment style after the shebang
          const header = [
            `${commentPrefix}File: create-typescript-server/${relativePath}${commentSuffix}`,
            `${commentPrefix}Copied from template: ${file}${commentSuffix}`,
            `${commentPrefix}This file was copied directly from the template.${commentSuffix}`,
            `${commentPrefix}To modify this file, edit the template in 'template/${file}'.${commentSuffix}`,
            '' // Empty line for spacing
          ].join('\n');
          
          content = shebangLine + '\n' + header + restOfContent;
        }
      }

      // Write the processed file
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, content);
    });

    await Promise.all(createFilePromises);

    spinner.succeed(chalk.green("MCP server created successfully!"));

    if (answers.installForClaude) {
      await updateClaudeConfig(config.name, directory);
    }

    // Print next steps
    console.log("\nNext steps:");
    console.log(chalk.cyan(`  cd ${directory}`));
    console.log(chalk.cyan("  npm install"));
    console.log(
      chalk.cyan(`  npm run build  ${chalk.reset("# or: npm run watch")}`),
    );
    console.log(
      chalk.cyan(
        `  npm link       ${chalk.reset("# optional, to make available globally")}\n`,
      ),
    );
  } catch (error) {
    spinner.fail(chalk.red("Failed to create MCP server"));
    console.error(error);
    process.exit(1);
  }
}

const program = new Command()
  .name("create-mcp-server")
  .description("Create a new MCP server")
  .argument("<directory>", "Directory to create the server in")
  .option("-n, --name <name>", "Name of the server")
  .option("-d, --description <description>", "Description of the server")
  .action(createServer);

program.parse();
