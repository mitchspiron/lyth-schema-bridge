export class StringUtils {
  /**
   * COnvert to PascalCase
   */
  static toPascalCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter) => letter.toUpperCase())
      .replace(/\s+/g, "")
      .replace(/[-_]/g, "");
  }

  /**
   * Convert to camelCase
   */
  static toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  /**
   * Convert to snake_case
   */
  static toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, "_$1")
      .toLowerCase()
      .replace(/^_/, "");
  }

  /**
   * Convert to kebab-case
   */
  static toKebabCase(str: string): string {
    return str
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase()
      .replace(/^-/, "");
  }

  /**
   * Pluralize a string
   */
  static pluralize(str: string): string {
    if (str.endsWith("y")) {
      return str.slice(0, -1) + "ies";
    }
    if (
      str.endsWith("s") ||
      str.endsWith("x") ||
      str.endsWith("ch") ||
      str.endsWith("sh")
    ) {
      return str + "es";
    }
    return str + "s";
  }

  /**
   * Singularize a string
   */
  static singularize(str: string): string {
    if (str.endsWith("ies")) {
      return str.slice(0, -3) + "y";
    }
    if (str.endsWith("es")) {
      return str.slice(0, -2);
    }
    if (str.endsWith("s")) {
      return str.slice(0, -1);
    }
    return str;
  }

  /**
   * Capitalize the first letter of a string
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Truncate a string
   */
  static truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + "...";
  }

  /**
   * Generates a slug
   */
  static slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
