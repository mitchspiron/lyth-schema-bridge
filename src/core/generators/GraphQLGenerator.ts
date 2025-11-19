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
}
