import * as readline from "readline";
import { ProjectConfig, SchemaField, SchemaModel } from "../core/parser/types";
import { Logger } from "../utils/Logger";

export class InteractiveCLI {
  private rl: readline.Interface;
  private answers: Partial<ProjectConfig> = {};

  // Get user input
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Run the interactive CLI
   */
  async run(): Promise<ProjectConfig> {
    // 1. Project name
    this.answers.projectName = await this.question("# Project name: ");
    console.log("");

    // 2. API type
    console.log("# Choose API type:");
    console.log("  1. REST API (Express)");
    console.log("  2. GraphQL (Apollo Server)");
    console.log("  3. Both REST and GraphQL");
    const apiChoice = await this.question("Enter choice (1-3): ");
    this.answers.apiType =
      apiChoice === "2" ? "graphql" : apiChoice === "3" ? "both" : "rest";
    console.log("");

    // 3. Database
    console.log("# Choose database:");
    console.log("  1. PostgreSQL");
    console.log("  2. MySQL");
    console.log("  3. SQLite");
    const dbChoice = await this.question("Enter choice (1-3): ");
    this.answers.database =
      dbChoice === "2" ? "mysql" : dbChoice === "3" ? "sqlite" : "postgresql";
    console.log("");

    // 4. Authentication
    this.answers.authentication = await this.confirm(
      "# Include authentication system?"
    );
    console.log("");

    // 5. Models
    console.log("# Define your models (entities)");
    if (this.answers.authentication) {
      console.log(
        "   ℹ:  A User model will be automatically added for authentication.\n"
      );
    }

    this.answers.models = [];
    let addMoreModels = true;

    while (addMoreModels) {
      const model = await this.defineModel();
      this.answers.models.push(model);

      addMoreModels = await this.confirm("\n# Add another model?");
      console.log("");
    }

    // 6. Summary and confirmation
    this.displaySummary();

    const confirmed = await this.confirm(
      "✓ Generate project with this configuration?"
    );

    if (!confirmed) {
      Logger.warning("\n✗ Project generation cancelled.");
      process.exit(0);
    }

    this.rl.close();
    return this.answers as ProjectConfig;
  }

  /**
   * Define a model
   */
  private async defineModel(): Promise<SchemaModel> {
    console.log("\n─────────────────────────────────────");
    const name = await this.question(
      "Model name (e.g., Post, Product, Category): "
    );

    const fields: SchemaField[] = [];
    let addMoreFields = true;

    console.log(`\n# Define fields for ${name}:`);

    while (addMoreFields) {
      const fieldName = await this.question("  Field name: ");

      console.log("  Field type:");
      console.log("    1. string    5. date");
      console.log("    2. email     6. json");
      console.log("    3. number    7. float");
      console.log("    4. boolean");
      const typeChoice = await this.question("  Enter choice (1-7): ");

      const typeMap: Record<string, string> = {
        "1": "string",
        "2": "email",
        "3": "number",
        "4": "boolean",
        "5": "date",
        "6": "json",
        "7": "float",
      };
      const type = typeMap[typeChoice] || "string";

      const required = await this.confirm("  Required?");
      const unique = await this.confirm("  Unique?");

      fields.push({ name: fieldName, type, required, unique });

      addMoreFields = await this.confirm("  Add another field?");
    }

    const timestamps = await this.confirm(
      `\n# Add timestamps (createdAt, updatedAt) to ${name}?`
    );

    return { name, fields, timestamps };
  }

  /**
   * Display the summary
   */
  private displaySummary(): void {
    console.log(
      "\n╔═══════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║                      CONFIGURATION SUMMARY                ║"
    );
    console.log(
      "╚═══════════════════════════════════════════════════════════╝\n"
    );

    console.log(`✓ Project: ${this.answers.projectName}`);
    console.log(`✓ API Type: ${this.answers.apiType?.toUpperCase()}`);
    console.log(`✓ Database: ${this.answers.database?.toUpperCase()}`);
    console.log(
      `=> Authentication: ${this.answers.authentication ? "Yes" : "No"}`
    );
    console.log(`\n✓ Models (${this.answers.models?.length}):`);

    this.answers.models?.forEach((model, idx) => {
      console.log(`\n  ${idx + 1}. ${model.name}`);
      console.log(`     Fields: ${model.fields.length}`);
      model.fields.forEach((field) => {
        const badges = [];
        if (field.required) badges.push("required");
        if (field.unique) badges.push("unique");
        console.log(
          `       - ${field.name}: ${field.type} ${
            badges.length ? `[${badges.join(", ")}]` : ""
          }`
        );
      });
      if (model.timestamps) {
        console.log("       - createdAt: date [auto]");
        console.log("       - updatedAt: date [auto]");
      }
    });

    console.log("\n");
  }

  /**
   * Ask a question
   */
  private question(query: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(query, resolve);
    });
  }

  /**
   * Ask a confirmation
   */
  private async confirm(query: string): Promise<boolean> {
    const answer = await this.question(`${query} (y/n): `);
    return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
  }
}
