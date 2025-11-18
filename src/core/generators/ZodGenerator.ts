import { SchemaField, SchemaModel } from "../parser/types";

export class ZodGenerator {
  /**
   * Generates Zod schemas based on the provided models.
   * @param models The array of schema models.
   * @returns The generated Zod schemas as a string.
   */
  static generate(models: SchemaModel[]): string {
    const imports = "import { z } from 'zod';\n\n";
    const schemas = models
      .map((model) => this.generateSchema(model))
      .join("\n\n");

    return imports + schemas;
  }

  /**
   * Generate Zod schema for a model
   */
  private static generateSchema(model: SchemaModel): string {
    const fields = model.fields.map((field) => this.generateField(field));

    if (model.timestamps) {
      fields.push(`  createdAt: z.date().optional()`);
      fields.push(`  updatedAt: z.date().optional()`);
    }

    const schemaName = `${model.name}Schema`;
    const createSchemaName = `Create${model.name}Schema`;
    const updateSchemaName = `Update${model.name}Schema`;

    return `
    // Schema for ${model.name}
    export const ${schemaName} = z.object({
    id: z.string().uuid().optional(),
    ${fields.join(",\n")}
    });

    // Schema for creating ${model.name}
    export const ${createSchemaName} = ${schemaName}.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    });

    // Schema for updating ${model.name}
    export const ${updateSchemaName} = ${createSchemaName}.partial();

    // TypeScript types
    export type ${model.name} = z.infer<typeof ${schemaName}>;
    export type Create${model.name} = z.infer<typeof ${createSchemaName}>;
    export type Update${model.name} = z.infer<typeof ${updateSchemaName}>;
    `;
  }

  /**
   * Generate a Zod field
   */
  private static generateField(field: SchemaField): string {
    const zodType = this.mapToZodType(field.type);
    const validation = field.required ? zodType : `${zodType}.optional()`;

    return `  ${field.name}: ${validation}`;
  }

  /**
   * Map field type to Zod type
   */
  private static mapToZodType(type: string): string {
    const mapping: Record<string, string> = {
      string: "z.string()",
      email: "z.string().email()",
      number: "z.number().int()",
      float: "z.number()",
      boolean: "z.boolean()",
      date: "z.date()",
      json: "z.any()",
    };
    return mapping[type.toLowerCase()] || "z.string()";
  }

  /**
   * Generate a DTO file content for a model
   */
  static generateDTOFile(model: SchemaModel): string {
    const imports = "import { z } from 'zod';\n\n";

    return imports + this.generateSchema(model);
  }

  /**
   * Add custom validations based on field properties
   */
  static addCustomValidations(field: SchemaField): string {
    const validations: string[] = [];

    if (field.type === "string") {
      validations.push(".min(1, 'Must not be empty')");
    }

    if (field.type === "email") {
      validations.push(".email('Invalid email format')");
    }

    return validations.join("");
  }
}
