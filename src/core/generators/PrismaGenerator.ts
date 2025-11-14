import { ProjectConfig, SchemaField, SchemaModel } from "../parser/types";

export class PrismaGenerator {
  /**
   * Generates the Prisma schema based on the project configuration.
   * @param config The project configuration object.
   * @returns The generated Prisma schema.
   */
  static generate(config: ProjectConfig): string {
    const datasource = this.generateDatasource(config.database);
    const generator = this.generateGenerator();
    const models = config.models
      .map((model) => this.generateModel(model))
      .join("\n\n");

    return `${datasource}\n\n${generator}\n\n${models}`;
  }

  /**
   * Generate datasource configuration
   */
  private static generateDatasource(database: string): string {
    const provider = database === "postgresql" ? "postgresql" : database;
    return `datasource db {
      provider = "${provider}"
      url = env("DATABASE_URL")
    }`;
  }

  /**
   * Generate Prisma Client generator configuration
   */
  private static generateGenerator(): string {
    return `generator client {
      provider = "prisma-client-js"
    }`;
  }

  /**
   * Generate Prisma model
   */
  private static generateModel(model: SchemaModel): string {
    const fields = [
      "   id String @id @default(uuid())",
      ...model.fields.map((f) => this.generateField(f)),
    ];

    if (model.timestamps) {
      fields.push("   createdAt DateTime @default(now())");
      fields.push("   updatedAt DateTime @updatedAt");
    }

    return `model ${model.name} {
      ${fields.join("\n")}
    }`;
  }

  /**
   * Generate a Prisma field
   */
  private static generateField(field: SchemaField): string {
    const type = this.mapTypeToPrisma(field.type);
    const optional = field.required ? "" : "?";
    const unique = field.unique ? "@unique" : "";
    const defaultValue = field.default ? ` @default(${field.default})` : "";

    return `   ${field.name} ${type}${optional}${unique}${defaultValue}`;
  }

  /**
   * Map a field type to a Prisma type
   */
  private static mapTypeToPrisma(type: string): string {
    const mapping: Record<string, string> = {
      string: "String",
      email: "String",
      number: "Int",
      float: "Float",
      boolean: "Boolean",
      date: "DateTime",
      json: "Json",
    };
    return mapping[type.toLocaleLowerCase()] || "String";
  }

  /**
   * Generate a Prisma relation (if needed)
   */
  private static generateRelation(field: SchemaField): string {
    if (!field.relation) return "";

    const { model, type } = field.relation;

    switch (type) {
      case "one-to-one":
        return `   ${field.name} ${model}? @relation(fields: [${field.name}Id], references: [id])`;
      case "one-to-many":
        return `   ${field.name} ${model}[]`;
      case "many-to-many":
        return `   ${field.name} ${model}[]`;
      default:
        return "";
    }
  }
}
