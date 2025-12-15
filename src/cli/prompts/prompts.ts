export class PromptHelpers {
  /**
   * Display choices
   */
  static displayChoices(title: string, choices: string[]): void {
    console.log(title);
    choices.forEach((choice, index) => {
      console.log(`  ${index + 1}. ${choice}`);
    });
  }

  /**
   * Validate a numeric choice
   */
  static validateNumericChoice(
    input: string,
    min: number,
    max: number
  ): boolean {
    const num = parseInt(input);
    return !isNaN(num) && num >= min && num <= max;
  }

  /**
   * Validate a project name
   */
  static validateProjectName(name: string): boolean {
    return /^[a-z0-9-]+$/.test(name) && name.length > 0;
  }

  /**
   * Validate a model name
   */
  static validateModelName(name: string): boolean {
    return /^[A-Z][a-zA-Z0-9]*$/.test(name);
  }

  /**
   * Validate a field name
   */
  static validateFieldName(name: string): boolean {
    return /^[a-z][a-zA-Z0-9]*$/.test(name);
  }

  /**
   * Show the progress
   */
  static showProgress(current: number, total: number, label: string): void {
    const percentage = Math.round((current / total) * 100);
    const filled = Math.round((current / total) * 30);
    const empty = 30 - filled;

    const bar = "█".repeat(filled) + "░".repeat(empty);
    process.stdout.write(`\r${label} [${bar}] ${percentage}%`);

    if (current === total) {
      console.log();
    }
  }
}
