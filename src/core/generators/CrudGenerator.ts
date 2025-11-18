import { SchemaModel } from "../parser/types";

export class CrudGenerator {
  static generateRepository(model: SchemaModel): string {
    const modelName = model.name;
    const modelLower = modelName.toLowerCase();

    return `import { ${modelName}, Create${modelName}, Update${modelName} } from '../../application/dto/${modelLower}';
  
    /**
     * Repository interface for ${modelName}
     * Defines data access methods for ${modelName} entities.
     */
    export interface I${modelName}Repository {
        /**
         * Find all ${modelName.toLowerCase()}s
         */
        findAll(): Promise<${modelName}[]>;

        /**
         * Find a ${modelName.toLowerCase()} by ID
         */
        findById(id: string): Promise<${modelName} | null>;

        /**
         * Create a new ${modelName.toLowerCase()}
         */
        create(data: Create${modelName}): Promise<${modelName}>;

        /**
         * Update an existing ${modelName.toLowerCase()}
         */
        update(id: string, data: Update${modelName}): Promise<${modelName}>;

        /**
         * Delete a ${modelName.toLowerCase()}
         */
        delete(id: string): Promise<void>;
    }`;
  }

  /**
   * Generate primsa implementation of repository
   */
  static generateRespositoryImpl(model: SchemaModel): string {
    const modelName = model.name;
    const modelLower = modelName.toLowerCase();

    return `import { PrismaClient } from '@prisma/client';
        import { I${modelName}Repository } from '../../../domain/repositories/${modelName}Repository';
        import { ${modelName}, Create${modelName}, Update${modelName} } from '../../../application/dto/${modelLower}.dto';

        /**
         * Prisma implementation of ${modelName}Repository
         */
        export class ${modelName}RepositoryImpl implements I${modelName}Repository {
        constructor(private prisma: PrismaClient) {}

        async findAll(): Promise<${modelName}[]> {
            try {
            return await this.prisma.${modelLower}.findMany({
                orderBy: { createdAt: 'desc' }
            });
            } catch (error) {
            throw new Error(\`Failed to fetch ${modelLower}s: \${error}\`);
            }
        }

        async findById(id: string): Promise<${modelName} | null> {
            try {
            return await this.prisma.${modelLower}.findUnique({
                where: { id }
            });
            } catch (error) {
            throw new Error(\`Failed to fetch ${modelLower}: \${error}\`);
            }
        }

        async create(data: Create${modelName}): Promise<${modelName}> {
            try {
            return await this.prisma.${modelLower}.create({
                data
            });
            } catch (error) {
            throw new Error(\`Failed to create ${modelLower}: \${error}\`);
            }
        }

        async update(id: string, data: Update${modelName}): Promise<${modelName}> {
            try {
            return await this.prisma.${modelLower}.update({
                where: { id },
                data
            });
            } catch (error) {
            throw new Error(\`Failed to update ${modelLower}: \${error}\`);
            }
        }

        async delete(id: string): Promise<void> {
            try {
            await this.prisma.${modelLower}.delete({
                where: { id }
            });
            } catch (error) {
            throw new Error(\`Failed to delete ${modelLower}: \${error}\`);
            }
        }
        }`;
  }

  /**
   * Generates use case class for the given model
   */
  static generateUseCase(model: SchemaModel): string {
    const modelName = model.name;
    const modelLower = modelName.toLowerCase();

    return `import { I${modelName}Repository } from '../../domain/repositories/${modelName}Repository';
        import { ${modelName}, Create${modelName}, Update${modelName} } from '../dto/${modelLower}.dto';

        /**
         * Use cases for ${modelName}
         * Contains business logic for ${modelName} operations
         */
        export class ${modelName}UseCases {
        constructor(private repository: I${modelName}Repository) {}

        /**
         * Get all ${modelLower}s
         */
        async getAll(): Promise<${modelName}[]> {
            return this.repository.findAll();
        }

        /**
         * Get a ${modelLower} by ID
         * @throws Error if ${modelLower} not found
         */
        async getById(id: string): Promise<${modelName}> {
            const ${modelLower} = await this.repository.findById(id);
            
            if (!${modelLower}) {
            throw new Error('${modelName} not found');
            }
            
            return ${modelLower};
        }

        /**
         * Create a new ${modelLower}
         */
        async create(data: Create${modelName}): Promise<${modelName}> {
            // Add any business logic validation here
            return this.repository.create(data);
        }

        /**
         * Update an existing ${modelLower}
         * @throws Error if ${modelLower} not found
         */
        async update(id: string, data: Update${modelName}): Promise<${modelName}> {
            // Check if ${modelLower} exists
            await this.getById(id);
            
            // Add any business logic validation here
            return this.repository.update(id, data);
        }

        /**
         * Delete a ${modelLower}
         * @throws Error if ${modelLower} not found
         */
        async delete(id: string): Promise<void> {
            // Check if ${modelLower} exists
            await this.getById(id);
            
            return this.repository.delete(id);
        }
    }`;
  }

  /**
   * Generates domain entity (optional)
   */
  static generateEntity(model: SchemaModel): string {
    const modelName = model.name;

    const fields = model.fields
      .map((f) => {
        const type = this.mapFieldType(f.type);
        const optional = f.required ? "" : "?";
        return `    ${f.name}${optional}: ${type};`;
      })
      .join("\n");

    const timestampFields = model.timestamps
      ? `
    createdAt: Date;
    updatedAt: Date;`
      : "";

    return `/**
        * ${modelName} Entity
        * Domain model for ${modelName}
        */
        export class ${modelName}Entity {
        id: string;
        ${fields}${timestampFields}

        constructor(data: Partial<${modelName}Entity>) {
            Object.assign(this, data);
        }

        /**
         * Business logic methods can be added here
         */
        }`;
  }

  /**
   * Maps schema field types to TypeScript types
   * @private
   * @param fieldType
   * @return {string}
   */
  private static mapFieldType(fieldType: string): string {
    const mapping: Record<string, string> = {
      string: "string",
      email: "string",
      number: "number",
      float: "number",
      boolean: "boolean",
      date: "Date",
      json: "any",
    };
    return mapping[fieldType] || "any";
  }
}
