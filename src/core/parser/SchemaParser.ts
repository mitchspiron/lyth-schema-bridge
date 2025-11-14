import { ProjectConfig, SchemaModel } from "./types";

export class SchemaParser {
  /**
   * Parses the project configuration and returns the schema models.
   * @param config The project configuration object.
   * @returns An array of schema models defined in the project configuration.
   */
  static parse(config: ProjectConfig): SchemaModel[] {
    return config.models;
  }

  /**
   * Validates the project configuration.
   * @param config The project configuration object.
   * @returns True if the configuration is valid, false otherwise.
   */
  static validationConfig(config: ProjectConfig): boolean {
    // Validate project name
    if (!config.projectName || config.projectName.trim() === "") {
      throw new Error("Project name is required.");
    }

    // Validate models
    if (config.models && config.models.length === 0) {
      throw new Error(
        "At least one model must be defined in the project configuration."
      );
    }

    // Validate each model
    config.models.forEach((model) => {
      this.validateModel(model);
    });

    return true;
  }

  /**
   * Validates a schema model.
   * @param model
   */
  private static validateModel(model: SchemaModel): void {
    // Validate model name
    if (!model.name || model.name.trim() === "") {
      throw new Error("Model name is required");
    }

    // Validate fields
    if (!model.fields || model.fields.length === 0) {
      throw new Error(`Model ${model.name} must have at least one field`);
    }

    // Validate each field
    model.fields.forEach((field) => {
      if (!field.name || field.name.trim() === "") {
        throw new Error(`Field name is required in model ${model.name}`);
      }

      if (!field.type || field.type.trim() === "") {
        throw new Error(`Field type is required in model ${model.name}`);
      }
    });
  }

  /**
   * Normalizes a project name.
   * @param name The project name to normalize.
   * @returns The normalized project name.
   */
  static normalizeProjectName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /**
   * Checks if a model name is reserved.
   * @param name The model name to check.
   * @returns True if the model name is reserved, false otherwise.
   */
  static isReservedModelName(name: string): boolean {
    const reserved = ["Model", "Schema", "Type", "Input", "Query", "Mutation"];
    return reserved.includes(name);
  }
}
