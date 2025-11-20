import { SchemaModel } from "../parser/types";

export class GraphQLGenerator {
  /**
   * Generates GraphQL type definition for a given model
   */
  static generateTypeDefs(models: SchemaModel[]): string {
    const types = models.map((m) => this.generateType(m)).join("\n\n");
    const queries = models.map((m) => this.generateQueries(m)).join("\n   ");
    const mutations = models
      .map((m) => this.generateMutations(m))
      .join("\n   ");

    return `import { gql } from 'apollo-server-express';
     /**
     * GraphQL Type Definitions
     */
    export const typeDefs = gql\`
    ${types}

    type Query {
        ${queries}
    }

    type Mutation {
        ${mutations}
    }
    \`;`;
  }

  /**
   * Generates a GraphQL type for a single model
   */
  private static generateType(model: SchemaModel): string {
    const fields = model.fields
      .map((f) => {
        const type = this.mapTypeToGraphQL(f.type);
        const required = f.required ? "!" : "";
        return `    ${f.name}: ${type}${required}`;
      })
      .join("\n");

    const timestamps = model.timestamps
      ? `
    createdAt: String!
    updatedAt: String!`
      : "";

    const inputFields = model.fields
      .map((f) => {
        const type = this.mapTypeToGraphQL(f.type);
        const required = f.required ? "!" : "";
        return `    ${f.name}: ${type}${required}`;
      })
      .join("\n");

    return `type ${model.name} {
        id: ID!
        ${fields}${timestamps}
    }
    
    input Create${model.name}Input {
        ${inputFields}
    }
    
    input Update${model.name}Input {
      ${model.fields
        .map((f) => `${f.name}: ${this.mapTypeToGraphQL(f.type)}`)
        .join("\n")}
    } `;
  }

  /**
   * Generates GraphQL queries for a model
   */
  private static generateQueries(model: SchemaModel): string {
    const plural = `${model.name.toLowerCase()}s`;
    const single = model.name.toLowerCase();
    return `${plural}: [${model.name}!]!
        ${single}(id: ID!): ${model.name}`;
  }

  /**
   * Generates GraphQL mutations for a model
   */
  private static generateMutations(model: SchemaModel): string {
    return `create${model.name}(input: Create${model.name}Input!): ${model.name}!
        update${model.name}(id: ID!, input: Update${model.name}Input!): ${model.name}!
        delete${model.name}(id: ID!): Boolean!`;
  }

  /**
   * Maps schema field types to GraphQL types
   * @private
   * @param fieldType
   */
  private static mapTypeToGraphQL(type: string): string {
    const mapping: Record<string, string> = {
      string: "String",
      email: "String",
      number: "Int",
      float: "Float",
      boolean: "Boolean",
      date: "String",
      json: "String",
    };
    return mapping[type.toLowerCase()] || "String";
  }

  /**
   * Generates GraphQL resolvers
   */
  static generateResolvers(models: SchemaModel): string {
    const modelName = models.name;
    const modelLower = modelName.toLowerCase();
    const plural = `${modelLower}s`;

    return `import { ${modelName}UseCases } from '../../application/use-cases/${modelName}UseCases';

    /**
     * GraphQL Resolvers for ${modelName}
     */
    export const ${modelLower}Resolvers = (useCases: ${modelName}UseCases) => ({
      Query: {
        /**
         * Get all ${plural}
         */
        ${plural}: async () => {
          return useCases.getAll();
        },

        /**
         * Get a ${modelLower} by ID
         */
        ${modelLower}: async (_: any, { id }: { id: string }) => {
          return useCases.getById(id);
        }
      },

      Mutation: {
        /**
         * Create a new ${modelLower}
         */
        create${modelName}: async (_: any, { input }: any) => {
          return useCases.create(input);
        },

        /**
         * Update a ${modelLower}
         */
        update${modelName}: async (_: any, { id, input }: any) => {
          return useCases.update(id, input);
        },

        /**
         * Delete a ${modelLower}
         */
        delete${modelName}: async (_: any, { id }: { id: string }) => {
          await useCases.delete(id);
          return true;
        }
      }
    });`;
  }

  /**
   * Generates Apollo Server
   */
  static generateApolloServer(
    models: SchemaModel[],
    withAuth: boolean
  ): string {
    const resolverImports = models
      .filter((m) => m.name !== "User" || !withAuth)
      .map(
        (m) =>
          `import { ${m.name.toLowerCase()}Resolvers } from '../../../presentation/graphql/resolvers/${m.name.toLowerCase()}.resolvers';`
      )
      .join("\n");

    const useCaseImports = models
      .filter((m) => m.name !== "User" || !withAuth)
      .map(
        (m) =>
          `import { ${m.name}UseCases } from '../../../application/use-cases/${m.name}UseCases';`
      )
      .join("\n");

    const repoImplImports = models
      .filter((m) => m.name !== "User" || !withAuth)
      .map(
        (m) =>
          `import { ${m.name}RepositoryImpl } from '../../database/repositories/${m.name}RepositoryImpl';`
      )
      .join("\n");

    const setupCode = models
      .filter((m) => m.name !== "User" || !withAuth)
      .map((m) => {
        const modelLower = m.name.toLowerCase();
        return `  const ${modelLower}Repository = new ${m.name}RepositoryImpl(prisma);
        const ${modelLower}UseCases = new ${m.name}UseCases(${modelLower}Repository);`;
      })
      .join("\n");

    const resolversSetup = models
      .filter((m) => m.name !== "User" || !withAuth)
      .map(
        (m) =>
          `...${m.name.toLowerCase()}Resolvers(${m.name.toLowerCase()}UseCases).Query`
      )
      .join(",\n      ");

    const mutationsSetup = models
      .filter((m) => m.name !== "User" || !withAuth)
      .map(
        (m) =>
          `...${m.name.toLowerCase()}Resolvers(${m.name.toLowerCase()}UseCases).Mutation`
      )
      .join(",\n      ");

    const authImport = withAuth ? `\nimport jwt from 'jsonwebtoken';` : "";

    const authContext = withAuth
      ? `
      // Extract user from JWT token
      const token = req.headers.authorization?.replace('Bearer ', '');
      let user = null;

      if (token) {
        try {
          user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        } catch (err) {
          console.error('Invalid token', err);
        }
      }
        
      return { user };`
      : `
      return {};`;

    return `import { ApolloServer } from 'apollo-server-express';
    import { PrismaClient } from '@prisma/client';
    import { typeDefs } from '../../../presentation/graphql/typeDefs';
    ${resolverImports}
    ${useCaseImports}
    ${repoImplImports}
    ${authImport}

    /**
     * Create and configure Apollo Server
     */
    export function createApolloServer(prisma: PrismaClient) {
      // Setup repositories and use cases
    ${setupCode}

      // Merge all resolvers
      const resolvers = {
        Query: {
          ${resolversSetup}
        },
        Mutation: {
          ${mutationsSetup}
        }
      };

      // Create Apollo Server
      const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => {${authContext}
        },
        introspection: process.env.NODE_ENV !== 'production',
        playground: process.env.NODE_ENV !== 'production'
      });

      return server;
    }`;
  }

  /**
   * Generates integration file Express + Apollo
   */
  static generateExpressApolloIntegration(): string {
    return `import express from 'express';
    import { PrismaClient } from '@prisma/client';
    import { createApolloServer } from './server';

    /**
     * Create Express app with Apollo Server
     */
    export async function createGraphQLApp() {
      const app = express();
      const prisma = new PrismaClient();

      // Create Apollo Server
      const apolloServer = createApolloServer(prisma);

      // Start Apollo Server
      await apolloServer.start();

      // Apply Apollo middleware to Express app
      apolloServer.applyMiddleware({ app, path: '/graphql' });

      // Health check endpoint
      app.get('/health', (req, res) => {
        res.json({ status: 'ok' });
      }

      return { app, prisma, apolloServer };
    }`;
  }
}
