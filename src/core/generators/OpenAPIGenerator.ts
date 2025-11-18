import { ProjectConfig, SchemaField, SchemaModel } from "../parser/types";

export class OpenAPIGenerator {
  // Generate OpenAPI specification based on the project configuration
  static generate(config: ProjectConfig): string {
    const spec = {
      openapi: "3.0.0",
      info: {
        title: `${config.projectName} API`,
        version: "1.0.0",
        description: `API specification for ${config.projectName}`,
      },
      servers: [
        {
          url: "http://localhost:3000/api",
          description: "Development server",
        },
        {
          url: "https://api.example.com",
          description: "Production server",
        },
      ],
      paths: this.generatePaths(config.models, config.authentication),
      components: {
        schemas: this.generateSchemas(config.models),
        securitySchemes: config.authentication
          ? {
              bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description: "JWT Authentication token",
              },
            }
          : {},
        responses: this.generateCommonResponses(),
      },
      security: config.authentication ? [{ bearerAuth: [] }] : [],
    };

    return JSON.stringify(spec, null, 2);
  }

  // Generate API paths for models and authentication
  private static generatePaths(models: SchemaModel[], withAuth: boolean): any {
    const paths: any = {};

    // Auth endpoints if authentication is enabled
    if (withAuth) {
      paths["/auth/register"] = this.generateAuthRegisterPath();
      paths["/auth/login"] = this.generateAuthLoginPath();
      paths["/auth/verify-email"] = this.generateAuthVerifyEmailPath();
      paths["/auth/forgot-password"] = this.generateAuthForgotPasswordPath();
      paths["/auth/reset-password"] = this.generateAuthResetPasswordPath();
      paths["/auth/profile"] = this.generateAuthProfilePath();
    }

    // Generate paths for each model
    models.forEach((model) => {
      if (model.name === "User" && withAuth) return; // Skip User model if auth is enabled

      const basePath = `/${model.name.toLowerCase()}s`;
      const idPath = `${basePath}/{id}`;

      paths[basePath] = this.generateCollectionPaths(model);
      paths[idPath] = this.generateItemPaths(model);
    });

    return paths;
  }

  // Generate collection paths for a model
  private static generateCollectionPaths(model: SchemaModel): any {
    const modelLower = model.name.toLowerCase();
    const modelPlural = `${modelLower}s`;

    return {
      get: {
        summary: `Get all ${modelPlural}`,
        tags: [model.name],
        description: `Retrieve a list of all ${modelPlural}.`,
        responses: {
          "200": {
            description: `Successful response`,
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: `#/components/schemas/${model.name}` },
                },
              },
            },
          },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
      post: {
        summary: `Create a ${modelLower}`,
        tags: [model.name],
        description: `Create a new ${modelLower}.`,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: `#/components/schemas/${model.name}` },
            },
          },
        },
        responses: {
          "201": {
            description: `Successful response`,
            content: {
              "application/json": {
                schema: { $ref: `#/components/schemas/${model.name}` },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    };
  }

  // Generate item paths for a model
  private static generateItemPaths(model: SchemaModel): any {
    const modelLower = model.name.toLowerCase();

    return {
      get: {
        summary: `Get a ${modelLower} by ID`,
        tags: [model.name],
        description: `Retrieve a single ${modelLower} by its ID.`,
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: `The ${modelLower} ID.`,
          },
        ],
        responses: {
          "200": {
            description: `Successful response`,
            content: {
              "application/json": {
                schema: { $ref: `#/components/schemas/${model.name}` },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
      put: {
        summary: `Update a ${modelLower} by ID`,
        tags: [model.name],
        description: `Update a single ${modelLower} by its ID.`,
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: `The ${modelLower} ID.`,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: `#/components/schemas/${model.name}` },
            },
          },
        },
        responses: {
          "200": {
            description: `Successfully updated`,
            content: {
              "application/json": {
                schema: { $ref: `#/components/schemas/${model.name}` },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
      delete: {
        summary: `Delete a ${modelLower} by ID`,
        tags: [model.name],
        description: `Delete an existing ${modelLower} by its ID.`,
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "204": {
            description: `Successfully deleted`,
          },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    };
  }

  // Generate data schemas for models
  private static generateSchemas(models: SchemaModel[]): any {
    const schemas: any = {};

    models.forEach((model) => {
      schemas[model.name] = this.generateModelSchema(model);
      schemas[`Create${model.name}`] = this.generateCreateSchema(model);
      schemas[`Update${model.name}`] = this.generateUpdateSchema(model);
    });

    return schemas;
  }

  // Generate a model schema
  private static generateModelSchema(model: SchemaModel): any {
    const properties: any = {
      id: {
        type: "string",
        format: "uuid",
        description: `Unique identifier for the ${model.name.toLowerCase()}.`,
      },
    };

    const required = ["id"];

    model.fields.forEach((field) => {
      properties[field.name] = this.generateFieldSchema(field);
      if (field.required) {
        required.push(field.name);
      }
    });

    if (model.timestamps) {
      properties.createdAt = {
        type: "string",
        format: "date-time",
        description: "Timestamp when the record was created.",
      };
      properties.updatedAt = {
        type: "string",
        format: "date-time",
        description: "Timestamp when the record was last updated.",
      };
      required.push("createdAt", "updatedAt");
    }

    return {
      type: "object",
      properties,
      required,
    };
  }

  // Generate schema for creating
  private static generateCreateSchema(model: SchemaModel): any {
    const schema = this.generateModelSchema(model);
    delete schema.properties.id;
    delete schema.properties.createdAt;
    delete schema.properties.updatedAt;
    schema.required = schema.required.filter(
      (r: string) => !["id", "createdAt", "updatedAt"].includes(r)
    );
    return schema;
  }

  // Generate schema for updating
  private static generateUpdateSchema(model: SchemaModel): any {
    const schema = this.generateModelSchema(model);
    schema.required = []; // No required fields for update
    return schema;
  }

  // Generate a field schema
  private static generateFieldSchema(field: SchemaField): any {
    const type = this.mapTypeToOpenAPIType(field.type);
    const schema: any = { type };

    if (field.type === "date") {
      schema.format = "date-time";
    }

    if (field.type === "email") {
      schema.format = "email";
    }

    if (field.default !== undefined) {
      schema.default = field.default;
    }

    schema.description = `${field.name} field`;

    return schema;
  }

  // Map custom types to OpenAPI types
  private static mapTypeToOpenAPIType(type: string): string {
    const mapping: Record<string, string> = {
      string: "string",
      email: "string",
      number: "integer",
      float: "number",
      boolean: "boolean",
      date: "string",
      json: "object",
    };
    return mapping[type.toLowerCase()] || "string";
  }

  // Generate common response components
  private static generateCommonResponses(): any {
    return {
      BadRequest: {
        description: "Bad Request - Invalid input data.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                error: { type: "string" },
              },
            },
          },
        },
      },
      NotFound: {
        description: "Not Found - Resource does not exist.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                error: { type: "string" },
              },
            },
          },
        },
      },
      InternalServerError: {
        description: "Internal Server Error - An unexpected error occurred.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                error: { type: "string" },
              },
            },
          },
        },
      },
    };
  }

  // Generate authentication register path
  private static generateAuthRegisterPath(): any {
    return {
      post: {
        summary: "Register a new user",
        tags: ["Authentication"],
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "name"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                  name: { type: "string", minLength: 2 },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    };
  }

  // Generate authentication login path
  private static generateAuthLoginPath(): any {
    return {
      post: {
        summary: "Login a user",
        tags: ["Authentication"],
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "User logged in successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    user: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
    };
  }

  // Generate authentication verify email path
  private static generateAuthVerifyEmailPath(): any {
    return {
      get: {
        summary: "Verify user email",
        tags: ["Authentication"],
        security: [],
        parameters: [
          {
            name: "token",
            in: "query",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Email verified successfully",
          },
        },
      },
    };
  }

  // Generate authentication forgot password path
  private static generateAuthForgotPasswordPath(): any {
    return {
      post: {
        summary: "Request password reset",
        tags: ["Authentication"],
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", format: "email" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Password reset email sent successfully",
          },
        },
      },
    };
  }

  // Generate authentication reset password path
  private static generateAuthResetPasswordPath(): any {
    return {
      post: {
        summary: "Reset user password",
        tags: ["Authentication"],
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token", "password"],
                properties: {
                  token: { type: "string" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Password reset successfully",
          },
        },
      },
    };
  }

  // Generate authentication profile path
  private static generateAuthProfilePath(): any {
    return {
      get: {
        summary: "Get user profile",
        tags: ["Authentication"],
        responses: {
          "200": {
            description: "User profile retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    email: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    };
  }
}
