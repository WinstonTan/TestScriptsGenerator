import * as fs from 'fs';
import * as path from 'path';

// Define the DetectedElement type
type DetectedElement = {
  type: string;
  selector: string;
  label?: string;
};

export async function generatePOM(pageName: string, elements: DetectedElement[]): Promise<string> {
  function toPascalCase(str: string) {
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[_\-\s]+/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
  const baseName = pageName.replace(/Page$/i, '');
  const className = `${toPascalCase(baseName)}Page`;

  let code = `import { Page, Locator } from '@playwright/test';\n\n`;
  code += `class ${className} {\n`;
  code += `  private readonly page: Page;\n`;

  const variableDeclarations: string[] = [];
  const initializedLocators: string[] = [];
  const methods: string[] = [];
  const processedLocators = new Set<string>();

  const sanitizeName = (name: string): string => {
    return name
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .filter((word) => word)
      .map((word, index) => (index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)))
      .join('');
  };

  for (const el of elements) {
    const { type, selector, label } = el;
    if (!selector || processedLocators.has(selector)) continue;
    processedLocators.add(selector);

    const safeSelector = selector.replace(/'/g, "\\'");
    const name = sanitizeName(label || selector);
    const methodSuffix = name.charAt(0).toUpperCase() + name.slice(1);

    variableDeclarations.push(`  readonly ${name}: Locator;`);
    initializedLocators.push(`    this.${name} = page.locator('${safeSelector}');`);

    if (type === 'input_text' || type === 'textarea') {
      methods.push(`
  async fill${methodSuffix}(value: string) {
    await this.${name}.fill(value);
  }`);
    }
    if (type === 'dropdown') {
      methods.push(`
  async select${methodSuffix}(value: string) {
    await this.${name}.selectOption(value);
  }`);
    }
    if (type === 'checkbox' || type === 'radio') {
      methods.push(`
  async check${methodSuffix}() {
    await this.${name}.check();
  }
  async uncheck${methodSuffix}() {
    await this.${name}.uncheck();
  }
  async isChecked${methodSuffix}(): Promise<boolean> {
    return await this.${name}.isChecked();
  }`);
    }
    if (type === 'button' || type === 'link') {
      methods.push(`
  async click${methodSuffix}() {
    await this.${name}.click();
  }`);
    }
  }

  code += variableDeclarations.join('\n') + '\n\n';
  code += `  constructor(page: Page) {\n    this.page = page;\n`;
  code += initializedLocators.join('\n') + '\n  }\n';
  code += methods.join('\n') + '\n';
  code += '}\n\n';
  code += `export { ${className} };\n`;

  return code;
}