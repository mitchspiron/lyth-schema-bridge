import { FileWriter } from "../utils/FileWriter";
import { Logger } from "../utils/Logger";
import * as path from "path";
import * as fs from "fs";

import { ProjectConfig } from "../parser/types";
import { SchemaParser } from "../parser/SchemaParser";
import { AuthGenerator } from "./AuthGenerator";
import { PrismaGenerator } from "./PrismaGenerator";
import { ZodGenerator } from "./ZodGenerator";
import { OpenAPIGenerator } from "./OpenAPIGenerator";
import { CrudGenerator } from "./CrudGenerator";
import { RestApiGenerator } from "./RestApiGenerator";
import { GraphQLGenerator } from "./GraphQLGenerator";

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

  /**
   * Generates Prisma schema
   */
  private static async generatePrismaSchema(
    config: ProjectConfig,
    outputDir: string
  ): Promise<void> {
    const schema = PrismaGenerator.generate(config);
    const filePath = path.join(outputDir, "prisma", "schema.prisma");
    FileWriter.writeFile(filePath, schema);
  }

  /**
   * Generates Zod schemas
   */
  private static async generateZodSchemas(
    config: ProjectConfig,
    outputDir: string
  ): Promise<void> {
    config.models.forEach((model) => {
      const schema = ZodGenerator.generateDTOFile(model);
      const filePath = path.join(
        outputDir,
        "src/application/dto",
        `${model.name.toLowerCase()}.dto.ts`
      );
      FileWriter.writeFile(filePath, schema);
    });
  }

  /**
   * Generates OpenAPI specification
   */
  private static async generateOpenAPISpec(
    config: ProjectConfig,
    outputDir: string
  ): Promise<void> {
    const spec = OpenAPIGenerator.generate(config);
    const filePath = path.join(outputDir, "src/docs", "openapi.json");
    FileWriter.writeFile(filePath, spec);
  }

  /**
   * Generates CRUD layer
   */
  private static async generateCrudLayer(
    config: ProjectConfig,
    outputDir: string
  ): Promise<void> {
    config.models.forEach((model) => {
      // Skip User model if auth is enabled (handled separately)
      if (model.name === "User" && config.authentication) {
        return;
      }

      // Generate repository interface
      const repository = CrudGenerator.generateRepository(model);
      FileWriter.writeFile(
        path.join(
          outputDir,
          "src/domain/repositories",
          `${model.name}Repository.ts`
        ),
        repository
      );

      // Generates repository implementation
      const repositoryImpl = CrudGenerator.generateRepositoryImpl(model);
      FileWriter.writeFile(
        path.join(
          outputDir,
          "src/infrastructure/database/repositories",
          `${model.name}RepositoryImpl.ts`
        ),
        repositoryImpl
      );

      // Generate use cases
      const useCases = CrudGenerator.generateUseCases(model);
      FileWriter.writeFile(
        path.join(
          outputDir,
          "src/application/use-cases",
          `${model.name}UseCases.ts`
        ),
        useCases
      );

      // Generate domain entity (optional)
      const entity = CrudGenerator.generateEntity(model);
      FileWriter.writeFile(
        path.join(outputDir, "src/domain/entities", `${model.name}Entity.ts`),
        entity
      );
    });
  }

  /**
   * Generates REST API
   */
  private static async generateRestApi(
    config: ProjectConfig,
    outputDir: string
  ): Promise<void> {
    config.models.forEach((model) => {
      if (model.name === "User" && config.authentication) return;

      // Generates controller
      const controller = RestApiGenerator.generateController(model);
      FileWriter.writeFile(
        path.join(
          outputDir,
          "src/presentation/rest/controllers",
          `${model.name}Controller.ts`
        ),
        controller
      );

      // Generates routes
      const routes = RestApiGenerator.generateRoutes(model);
      FileWriter.writeFile(
        path.join(
          outputDir,
          "src/presentation/rest/routes",
          `${model.name.toLowerCase()}.routes.ts`
        ),
        routes
      );
    });

    // Generates Express app
    const app = RestApiGenerator.generateExpressApp(
      config.models,
      config.authentication
    );
    FileWriter.writeFile(
      path.join(outputDir, "src/infrastructure/http/express", "app.ts"),
      app
    );

    // Generates middlewares
    const errorMiddleware = RestApiGenerator.generateErrorMiddleware();
    FileWriter.writeFile(
      path.join(
        outputDir,
        "src/presentation/rest/middlewares",
        "error.middleware.ts"
      ),
      errorMiddleware
    );
  }

  /**
   * Generates GraphQL API
   */
  private static async generateGraphQLApi(
    config: ProjectConfig,
    outputDir: string
  ): Promise<void> {
    // Generates type definitions
    const typeDefs = GraphQLGenerator.generateTypeDefs(config.models);
    FileWriter.writeFile(
      path.join(outputDir, "src/presentation/graphql", "typeDefs.ts"),
      typeDefs
    );

    // Generates resolvers
    config.models.forEach((model) => {
      if (model.name === "User" && config.authentication) return;

      const resolvers = GraphQLGenerator.generateResolvers(model);
      FileWriter.writeFile(
        path.join(
          outputDir,
          "src/presentation/graphql/resolvers",
          `${model.name.toLowerCase()}.resolvers.ts`
        ),
        resolvers
      );
    });

    // Generates Apollo server
    const apolloServer = GraphQLGenerator.generateApolloServer(
      config.models,
      config.authentication
    );
    FileWriter.writeFile(
      path.join(outputDir, "src/infrastructure/http/graphql", "server.ts"),
      apolloServer
    );
  }

  /**
   * Generates authentication system
   */
  private static async generateAuthSystem(
    config: ProjectConfig,
    outputDir: string
  ): Promise<void> {
    // Generate auth service
    const authService = AuthGenerator.generateAuthService();
    FileWriter.writeFile(
      path.join(outputDir, "src/application/services", "AuthService.ts"),
      authService
    );

    // Generate auth controller
    const authController = AuthGenerator.generateAuthController();
    FileWriter.writeFile(
      path.join(
        outputDir,
        "src/presentation/rest/controllers",
        "AuthController.ts"
      ),
      authController
    );

    // Generate auth middleware
    const authMiddleware = AuthGenerator.generateAuthMiddleware();
    FileWriter.writeFile(
      path.join(
        outputDir,
        "src/presentation/rest/middlewares",
        "auth.middleware.ts"
      ),
      authMiddleware
    );

    // Generate auth routes
    const authRoutes = AuthGenerator.generateAuthRoutes();
    FileWriter.writeFile(
      path.join(outputDir, "src/presentation/rest/routes", "auth.routes.ts"),
      authRoutes
    );
  }

  /**
   * Generates configuration files
   */
  private static async generateConfigFiles(
    config: ProjectConfig,
    outputDir: string
  ): Promise<void> {
    // package.json
    const packageJson = this.generatePackageJson(config);
    FileWriter.writeFile(path.join(outputDir, "package.json"), packageJson);

    // tsconfig.json
    const tsConfig = this.generateTsConfig();
    FileWriter.writeFile(path.join(outputDir, "tsconfig.json"), tsConfig);

    // .env.example
    const envExample = this.generateEnvExample(config);
    FileWriter.writeFile(path.join(outputDir, ".env.example"), envExample);

    // .gitignore
    const gitignore = this.generateGitignore();
    FileWriter.writeFile(path.join(outputDir, ".gitignore"), gitignore);

    // README.md
    const readme = this.generateReadme(config);
    FileWriter.writeFile(path.join(outputDir, "README.md"), readme);
  }

  /**
   * Generates package.json
   */
  private static generatePackageJson(config: ProjectConfig): string {
    const dependencies: any = {
      "@prisma/client": "^6.18.0",
      "express": "^4.18.2",
      "cors": "^2.8.5",
      "helmet": "^7.1.0",
      "zod": "^4.1.13",
      "dotenv": "^17.2.3",
    };

    if (config.authentication) {
      dependencies["bcryptjs"] = "^3.0.2";
      dependencies["jsonwebtoken"] = "^9.0.2";
    }

    if (config.apiType === "graphql" || config.apiType === "both") {
      dependencies["apollo-server-express"] = "^3.13.0";
      dependencies["graphql"] = "^16.11.0";
    }

    const devDependencies: any = {
      "@types/express": "^4.17.21",
      "@types/node": "^24.9.2",
      "@types/cors": "^2.8.17",
      "prisma": "^6.18.0",
      "ts-node-dev": "^2.0.0",
      "typescript": "^5.9.3",
    };

    if (config.authentication) {
      devDependencies["@types/bcryptjs"] = "^2.4.6";
      devDependencies["@types/jsonwebtoken"] = "^9.0.10";
    }

    return JSON.stringify(
      {
        name: SchemaParser.normalizeProjectName(config.projectName),
        version: "1.0.0",
        description: `Generated by schema-bridge`,
        main: "dist/main.js",
        scripts: {
          "dev": "ts-node-dev --respawn --transpile-only src/main.ts",
          "build": "tsc",
          "start": "node dist/main.js",
          "prisma:generate": "prisma generate",
          "prisma:push": "prisma db push",
          "prisma:studio": "prisma studio",
        },
        dependencies,
        devDependencies,
      },
      null,
      2
    );
  }
}
