export interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  unique?: boolean;
  default?: any;
  relation?: {
    model: string;
    type: "one-to-one" | "one-to-many" | "many-to-many";
  };
}

export interface SchemaModel {
  name: string;
  fields: SchemaField[];
  timestamps?: boolean;
}

export interface ProjectConfig {
  projectName: string;
  apiType: "rest" | "graphql" | "both";
  database: "postgresql" | "mysql" | "sqlite";
  authentication: boolean;
  models: SchemaModel[];
}

export interface GeneratorOptions {
  outputDir: string;
  overwrite?: boolean;
}

export type PrismaType =
  | "String"
  | "Int"
  | "Float"
  | "Boolean"
  | "DateTime"
  | "Json"
  | "Enum"
  | "Relation";
export type ZodType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "object"
  | "array"
  | "enum";
export type OpenAPIType =
  | "string"
  | "integer"
  | "number"
  | "boolean"
  | "array"
  | "object";
