export enum LogLevel {
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
  WARNING = "WARNING",
  DEBUG = "DEBUG",
}

export class Logger {
  private static colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",

    // Foreground colors
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",

    // Background colors
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgYellow: "\x1b[43m",
    bgBlue: "\x1b[44m",
  };

  /**
   * Generale Log
   */
  static log(message: string, level: LogLevel = LogLevel.INFO): void {
    const timestamp = new Date().toISOString();
    const prefix = this.getPrefix(level);
    console.log(`${prefix} ${message}${this.colors.reset}`);
  }

  /**
   * Info Log
   */
  static info(message: string): void {
    console.log(`${this.colors.cyan}${message}${this.colors.reset}`);
  }

  /**
   * Success Log
   */
  static success(message: string): void {
    console.log(`${this.colors.green}${message}${this.colors.reset}`);
  }

  /**
   * Warning Log
   */
  static warning(message: string): void {
    console.log(`${this.colors.yellow}${message}${this.colors.reset}`);
  }

  /**
   * Error Log
   */
  static error(message: string, error?: Error): void {
    console.log(`${this.colors.red}${message}${this.colors.reset}`);
    if (error) {
      console.log(`${this.colors.red}${error.stack}${this.colors.reset}`);
    }
  }

  /**
   * Debug Log
   */
  static debug(message: string): void {
    if (process.env.DEBUG === "true") {
      console.log(`${this.colors.dim}[DEBUG] ${message}${this.colors.reset}`);
    }
  }

  /**
   * Log with tittle
   */
  static title(message: string): void {
    console.log(`\n${this.colors.bright}${this.colors.cyan}${"=".repeat(60)}`);
    console.log(`${message}`);
    console.log(`${"=".repeat(60)}${this.colors.reset}\n`);
  }

  /**
   * Log with box
   */
  static box(message: string): void {
    const lines = message.split("\n");
    const maxLength = Math.max(...lines.map((l) => l.length));
    const border = "─".repeat(maxLength + 4);

    console.log(`\n${this.colors.cyan}┌${border}┐`);
    lines.forEach((line) => {
      const padding = " ".repeat(maxLength - line.length);
      console.log(`│  ${line}${padding}  │`);
    });
    console.log(`└${border}┘${this.colors.reset}\n`);
  }

  /**
   * Progress bar
   */
  static progress(current: number, total: number, label: string = ""): void {
    const percentage = Math.round((current / total) * 100);
    const filled = Math.round((current / total) * 30);
    const empty = 30 - filled;

    const bar = "█".repeat(filled) + "░".repeat(empty);
    process.stdout.write(
      `\r${this.colors.cyan}${label} [${bar}] ${percentage}%${this.colors.reset}`
    );

    if (current === total) {
      console.log(); // New line when complete
    }
  }

  /**
   * Spinner (for long processes)
   */
  static spinner(message: string): { stop: () => void } {
    const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let i = 0;

    const interval = setInterval(() => {
      process.stdout.write(
        `\r${this.colors.cyan}${frames[i]} ${message}${this.colors.reset}`
      );
      i = (i + 1) % frames.length;
    }, 80);

    return {
      stop: () => {
        clearInterval(interval);
        process.stdout.write("\r\x1b[K"); // Clear line
      },
    };
  }

  /**
   * Table
   */
  static table(data: Array<Record<string, any>>): void {
    if (data.length === 0) return;

    const keys = Object.keys(data[0]);
    const colWidths = keys.map((key) => {
      const values = data.map((row) => String(row[key] || ""));
      return Math.max(key.length, ...values.map((v) => v.length));
    });

    // Header
    const header = keys.map((key, i) => key.padEnd(colWidths[i])).join(" │ ");
    console.log(`\n${this.colors.cyan}┌${"─".repeat(header.length + 2)}┐`);
    console.log(`│ ${header} │`);
    console.log(`├${"─".repeat(header.length + 2)}┤`);

    // Rows
    data.forEach((row) => {
      const rowStr = keys
        .map((key, i) => String(row[key] || "").padEnd(colWidths[i]))
        .join(" │ ");
      console.log(`│ ${rowStr} │`);
    });

    console.log(`└${"─".repeat(header.length + 2)}┘${this.colors.reset}\n`);
  }

  /**
   * Get the prefix according to the level
   */
  private static getPrefix(level: LogLevel): string {
    switch (level) {
      case LogLevel.INFO:
        return `${this.colors.cyan}ℹ`;
      case LogLevel.SUCCESS:
        return `${this.colors.green}✓`;
      case LogLevel.WARNING:
        return `${this.colors.yellow}⚠`;
      case LogLevel.ERROR:
        return `${this.colors.red}✗`;
      case LogLevel.DEBUG:
        return `${this.colors.dim}◆`;
      default:
        return "";
    }
  }

  /**
   * Display banner
   */
  static banner(): void {
    const banner = `
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        Welcome to Lyth Schema Bridge Generator              ║
║                                                            ║
║   Generate a complete full-stack API with Clean Arch       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `;
    console.log(`${this.colors.cyan}${banner}${this.colors.reset}`);
  }

  /**
   * Clear console
   */
  static clear(): void {
    console.clear();
  }
}
