#!/usr/bin/env node

import { Command } from "commander";
import { Logger } from "../utils/Logger";
import * as path from "path";
import * as fs from "fs";
import { ProjectGenerator } from "../core/generators/ProjectGenerator";

const program = new Command();

program
  .name("lyth-schema-bridge")
  .description("Generate full-stack APIs with Clean Architecture")
  .version("1.0.0");

// Command: init (interactive mode)
program
  .command("init")
  .description("Initialize a new project (interactive)")
  .option("-o, --output <dir>", "Output directory", ".")
  .action(async (options) => {
    try {
      Logger.clear();
      Logger.banner();

      const cli = new InteractiveCLI();
      const config = await cli.run();

      const outputDir = path.join(options.output, config.projectName);

      await ProjectGenerator.generate(config, outputDir);
    } catch (error: any) {
      Logger.error("Failed to generate project", error);
      process.exit(1);
    }
  });

// Command: generate (from config file)
program
  .command("generate")
  .description("Generate project from config file")
  .requiredOption("-c, --config <file>", "Configuration file")
  .option("-o, --output <dir>", "Output directory")
  .action(async (options) => {
    try {
      Logger.info("Loading configuration...");

      // Load config file
      const configPath = path.resolve(options.config);
      if (!fs.existsSync(configPath)) {
        Logger.error(`Config file not found: ${configPath}`);
        process.exit(1);
      }

      const config = require(configPath);

      const outputDir = options.output
        ? path.resolve(options.output)
        : path.join(process.cwd(), config.projectName);

      await ProjectGenerator.generate(config, outputDir);
    } catch (error: any) {
      Logger.error("Failed to generate project", error);
      process.exit(1);
    }
  });

// Command: validate (validate config file)
program
  .command("validate")
  .description("Validate a configuration file")
  .requiredOption("-c, --config <file>", "Configuration file")
  .action((options) => {
    try {
      const configPath = path.resolve(options.config);
      if (!fs.existsSync(configPath)) {
        Logger.error(`Config file not found: ${configPath}`);
        process.exit(1);
      }

      const config = require(configPath);
      const { SchemaParser } = require("../core/parser/SchemaParser");

      SchemaParser.validateConfig(config);
      Logger.success("✓ Configuration is valid!");
    } catch (error: any) {
      Logger.error("✗ Configuration is invalid:", error);
      process.exit(1);
    }
  });

// Command: example (generate example config)
program
  .command("example")
  .description("Generate an example configuration file")
  .option("-o, --output <file>", "Output file", "schema.config.js")
  .action((options) => {
    const exampleConfig = `module.exports = {
  projectName: 'my-awesome-api',
  apiType: 'rest', // 'rest' | 'graphql' | 'both'
  database: 'postgresql', // 'postgresql' | 'mysql' | 'sqlite'
  authentication: true,
  models: [
    {
      name: 'Post',
      timestamps: true,
      fields: [
        { name: 'title', type: 'string', required: true },
        { name: 'content', type: 'string', required: true },
        { name: 'published', type: 'boolean', required: true, default: 'false' },
        { name: 'authorId', type: 'string', required: true }
      ]
    },
    {
      name: 'Comment',
      timestamps: true,
      fields: [
        { name: 'content', type: 'string', required: true },
        { name: 'postId', type: 'string', required: true },
        { name: 'authorId', type: 'string', required: true }
      ]
    }
  ]
};`;

    fs.writeFileSync(options.output, exampleConfig);
    Logger.success(`✓ Example configuration created: ${options.output}`);
  });

program.parse();
