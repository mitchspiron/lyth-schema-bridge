import { FileWriter } from "../utils/FileWriter";
import { Logger } from "../utils/Logger";
import * as path from "path";
import * as fs from 'fs';

import { ProjectConfig } from "../parser/types";
import { SchemaParser } from "../parser/SchemaParser";
import { AuthGenerator } from "./AuthGenerator";

export class ProjectGenerator {
  /**
   * Generates the project complete
   */
  static async generate(
    config: ProjectConfig,
    outputDir: string
  ): Promise<void> {
    Logger.info("Lyth Schema Bridge - Starting project generation...\n");

    // 1. Validate config
    SchemaParser.validationConfig(config);

    // 2. Add User model if auth is enabled
    if (
      config.authentication &&
      !config.models.find((m) => m.name === "User")
    ) {
      config.models.unshift(AuthGenerator.generateAuthModel());
      Logger.info("✓ Added User model for authentication");
    }

    // 3. Create directory structure
    this.createDirectoryStructure(outputDir);
    Logger.info("✓ Created directory structure");

    // 4. Generates prisma schema
    await this.generatePrismaSchema(config, outputDir);
    Logger.info("✓ Generated prisma schema");

    // 5. Generates Zod schema
    await this.generateZodSchemas(config, outputDir);
    Logger.info("✓ Generated Zod schemas");

    // 6. Generates OpenAPI documentation
    await this.generateOpenAPISpec(config, outputDir);
    Logger.info("✓ Generated OpenAPI spec");

    // 7. Generates repositories and uses cases
    await this.generateCrudLayer(config, outputDir);
    Logger.info("✓ Generated repositories and use cases");

    // 8. Generates API by type choosed
    if (config.apiType === "rest" || config.apiType === "both") {
      await this.generateRestApi(config, outputDir);
      Logger.info("✓ Generated REST API");
    }

    if (config.apiType === "graphql" || config.apiType === "both") {
      await this.generateGraphQLApi(config, outputDir);
      Logger.info("✓ Generated GraphQL API");
    }

    // 9. Generates authentication if enabled
    if (config.authentication) {
      await this.generateAuthSystem(config, outputDir);
      Logger.info("✓ Generated authentication system");
    }

    // 10. Generates config files
    await this.generateConfigFiles(config, outputDir);
    Logger.info("✓ Generated configuration files");

    // 11. Generates main entrypoint
    await this.generateMainFile(config, outputDir);
    Logger.info("✓ Generated main entrypoint");

    // 12. Display instructions
    this.displayNextSteps(config, outputDir);
  }

  /**
   * Creates directories structure
   */
  private static createDirectoryStructure(baseDir: string): void {
    const dirs = [
      // Prisma
      "prisma",

      // Domain layer
      "src/domain/entities",
      "src/domain/repositories",

      // Application layer
      "src/application/use-cases",
      "src/application/dto",
      "src/application/services",

      // Infrastructure layer
      "src/infrastructure/database/repositories",
      "src/infrastructure/http/express",
      "src/infrastructure/http/graphql",

      // Presentation layer
      "src/presentation/rest/controllers",
      "src/presentation/rest/routes",
      "src/presentation/rest/middlewares",
      "src/presentation/graphql/resolvers",

      // Documentation
      "src/docs",
    ];

    dirs.forEach((dir) => {
      const fullPath = path.join(baseDir, dir);
      FileWriter.createDirectory(fullPath);
    });
  }
}
