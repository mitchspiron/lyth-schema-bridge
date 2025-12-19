import * as fs from 'fs';
import * as path from 'path';
import { CodeFormatter } from './CodeFormatter';

export class FileWriter {
  /**
   * Create a directory recursively
   */
  static createDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Write a file with automatic formatting
   */
  static writeFile(filePath: string, content: string, format: boolean = true): void {
    // Create the parent directory if necessary
    const dir = path.dirname(filePath);
    this.createDirectory(dir);

    // Format code if needed
    let finalContent = content;
    if (format) {
      finalContent = CodeFormatter.formatByExtension(content, filePath);
      finalContent = CodeFormatter.normalizeWhitespace(finalContent);
    }

    // Write File
    fs.writeFileSync(filePath, finalContent, 'utf-8');
  }

  /**
   * Read file
   */
  static readFile(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8');
  }

  /**
   * Check if file exists
   */
  static fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * Copy file
   */
  static copyFile(source: string, destination: string): void {
    const dir = path.dirname(destination);
    this.createDirectory(dir);
    fs.copyFileSync(source, destination);
  }

  /**
   * List files in a directory
   */
  static listFiles(dirPath: string): string[] {
    if (!fs.existsSync(dirPath)) {
      return [];
    }
    return fs.readdirSync(dirPath);
  }

  /**
   * Delete file
   */
  static deleteFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Delete directory recursively
   */
  static deleteDirectory(dirPath: string): void {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  }

  /**
   * Get file size
   */
  static getFileSize(filePath: string): number {
    if (!fs.existsSync(filePath)) {
      return 0;
    }
    return fs.statSync(filePath).size;
  }

  /**
   * Create a JSON file
   */
  static writeJSON(filePath: string, data: any): void {
    this.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Read a JSON file
   */
  static readJSON(filePath: string): any {
    const content = this.readFile(filePath);
    return JSON.parse(content);
  }
}
