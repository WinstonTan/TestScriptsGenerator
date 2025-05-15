node_modules/
import * as fs from 'fs';
import * as path from 'path';

// Define the DetectedElements type
type DetectedElements = {
  inputs: string[];
  buttons: string[];
  dropdowns: string[];
  checkboxes: string[];
  radios: string[];
  links: string[];
};

export async function generatePOM(pageName: string, elements: DetectedElements): Promise<string> {
  let code = `import { Page, Locator } from '@playwright/test';\n\n`;
  code += `export class ${pageName}Page {\n`;

  // Declare the `page` field
  code += `  private readonly page: Page;\n`;

  // Arrays to store variable declarations, constructor initializations, and methods
  const variableDeclarations: string[] = [];
  const initializedLocators: string[] = [];
  const methods: string[] = [];
  const processedLocators = new Set<string>(); // To track processed locators

  const sanitizeName = (name: string): string => {
    return name
      .replace(/[^a-zA-Z0-9]/g, ' ') // Replace non-alphanumeric characters with spaces
      .split(' ')
      .filter((word) => word) // Remove empty strings
      .map((word, index) => (index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)))
      .join('');
  };

  const addFieldWithMethods = (type: string, selector: string): void => {
    if (!selector || processedLocators.has(selector)) return;
    processedLocators.add(selector);

    // Escape single quotes in selector for safe code generation
    const safeSelector = selector.replace(/'/g, "\\'");

    const name = sanitizeName(selector);

    // Variable declaration
    variableDeclarations.push(`  readonly ${name}: Locator;`);

    // Constructor initialization
    initializedLocators.push(`    this.${name} = page.locator('${safeSelector}');`);

    // Methods based on type
    if (type === 'input' || type === 'textarea') {
      methods.push(`
  async fill${name.charAt(0).toUpperCase() + name.slice(1)}(value: string) {
    await this.${name}.fill(value);
  }`);
    }
    if (type === 'button' || type === 'link' || type === 'checkbox' || type === 'radio' || type === 'dropdown') {
      methods.push(`
  async click${name.charAt(0).toUpperCase() + name.slice(1)}() {
    await this.${name}.click();
  }`);
    }
  };

  // Add fields and methods for each element type
  Object.entries(elements).forEach(([type, selectors]) => {
    selectors.forEach((selector) => addFieldWithMethods(type, selector));
  });

  // Build the class code
  code += variableDeclarations.join('\n') + '\n\n';
  code += `  constructor(page: Page) {\n    this.page = page;\n`;
  code += initializedLocators.join('\n') + '\n  }\n';
  code += methods.join('\n') + '\n';
  code += '}\n';

  return code;
}