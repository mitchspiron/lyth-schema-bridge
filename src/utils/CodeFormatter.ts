import * as prettier from 'prettier';

export class CodeFormatter {
  /**
   * Format TypeScript code
   */
  static async formatTypeScript(code: string): Promise<string> {
    try {
      const result = await prettier.format(code, {
        parser: 'typescript',
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 100,
        tabWidth: 2,
        arrowParens: 'avoid',
      });
      return result;
    } catch (error) {
      console.warn('Warning: Could not format TypeScript code:', error);
      return code;
    }
  }

  /**
   * Format JavaScript code
   */
  static async formatJavaScript(code: string): Promise<string> {
    try {
      const result = await prettier.format(code, {
        parser: 'babel',
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 100,
        tabWidth: 2,
        arrowParens: 'avoid',
      });
      return result;
    } catch (error) {
      console.warn('Warning: Could not format JavaScript code:', error);
      return code;
    }
  }

  /**
   * Format JSON
   */
  static async formatJSON(code: string): Promise<string> {
    try {
      const result = await prettier.format(code, {
        parser: 'json',
        tabWidth: 2,
      });
      return result;
    } catch (error) {
      console.warn('Warning: Could not format JSON code:', error);
      return code;
    }
  }

  /**
   * Format code according to the file extension
   */
  static async formatByExtension(code: string, filePath: string): Promise<string> {
    const ext = filePath.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'ts':
      case 'tsx':
        return await this.formatTypeScript(code);
      case 'js':
      case 'jsx':
        return await this.formatJavaScript(code);
      case 'json':
        return await this.formatJSON(code);
      case 'prisma':
        // Prettier doesn't support Prisma yet, return as is
        return this.formatPrismaSchema(code);
      default:
        return code;
    }
  }

  /**
   * Format a Prisma schema (manual formatting since Prettier doesn't support it yet)
   */
  private static formatPrismaSchema(code: string): string {
    // Simple formatting for Prisma
    const lines = code.split('\n');
    const formatted: string[] = [];
    let inBlock = false;

    for (let line of lines) {
      line = line.trim();

      if (!line) {
        formatted.push('');
        continue;
      }

      // Start of block (datasource, generator, model)
      if (line.match(/^(datasource|generator|model|enum)/)) {
        if (formatted.length > 0 && formatted[formatted.length - 1] !== '') {
          formatted.push('');
        }
        formatted.push(line);
        inBlock = true;
        continue;
      }

      // End of block
      if (line === '}') {
        formatted.push('}');
        inBlock = false;
        continue;
      }

      // Inside block - indent
      if (inBlock) {
        formatted.push('  ' + line);
      } else {
        formatted.push(line);
      }
    }

    return formatted.join('\n') + '\n';
  }

  /**
   * Normalize whitespace in code
   */
  static normalizeWhitespace(code: string): string {
    return (
      code
        .replace(/[ \t]+$/gm, '') // Remove trailing spaces
        .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
        .trim() + '\n'
    );
  }

  /**
   * Format all code files in a project directory
   */
  static async formatProject(projectPath: string): Promise<void> {
    const fs = require('fs');
    const { glob } = require('glob');

    console.log('# Formatting generated code...');

    // Find all TypeScript and JavaScript files
    const files = await glob(`${projectPath}/**/*.{ts,js,json}`, {
      ignore: ['**/node_modules/**', '**/dist/**'],
    });

    let formattedCount = 0;

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const formatted = await this.formatByExtension(content, file);

        if (content !== formatted) {
          fs.writeFileSync(file, formatted, 'utf-8');
          formattedCount++;
        }
      } catch (error) {
        console.warn(`Warning: Could not format ${file}:`, error);
      }
    }

    console.log(`✓ Formatted ${formattedCount} files`);
  }
}
