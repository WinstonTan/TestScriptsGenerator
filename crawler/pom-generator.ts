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
    const name = sanitizeName(selector);

    // Skip if the locator has already been processed
    if (processedLocators.has(name)) {
      return;
    }
    processedLocators.add(name);

    // Add variable declaration
    variableDeclarations.push(`  private readonly ${name}: Locator;`);
    initializedLocators.push(`    this.${name} = page.locator('${selector}');`);

    // Add getter and methods
    methods.push(`  /** ${type.charAt(0).toUpperCase() + type.slice(1)} */`);
    methods.push(`  get${name.charAt(0).toUpperCase() + name.slice(1)}(): Locator {`);
    methods.push(`    return this.${name};`);
    methods.push(`  }\n`);

    if (type.toLowerCase().includes('input')) {
      methods.push(`  async fill${name.charAt(0).toUpperCase() + name.slice(1)}(value: string): Promise<void> {`);
      methods.push(`    await this.${name}.fill(value);`);
      methods.push(`  }\n`);
    } else if (type.toLowerCase().includes('button')) {
      methods.push(`  async click${name.charAt(0).toUpperCase() + name.slice(1)}(): Promise<void> {`);
      methods.push(`    await this.${name}.click();`);
      methods.push(`  }\n`);
    }
  };

  // Generate methods for all detected inputs
  for (const input of elements.inputs) {
    addFieldWithMethods('Input', input);
  }

  // Generate methods for all detected buttons
  for (const button of elements.buttons) {
    addFieldWithMethods('Button', button);
  }

  // Generate methods for all detected dropdowns
  for (const dropdown of elements.dropdowns) {
    addFieldWithMethods('Dropdown', dropdown);
  }

  // Generate methods for all detected checkboxes
  for (const checkbox of elements.checkboxes) {
    addFieldWithMethods('Checkbox', checkbox);
  }

  // Generate methods for all detected radios
  for (const radio of elements.radios) {
    addFieldWithMethods('Radio', radio);
  }

  // Generate methods for all detected links
  for (const link of elements.links) {
    addFieldWithMethods('Link', link);
  }

  // Add variable declarations
  code += variableDeclarations.join('\n') + '\n\n';

  // Add constructor to initialize locators
  code += `  constructor(page: Page) {\n`;
  code += `    this.page = page;\n`;
  code += initializedLocators.join('\n') + '\n';
  code += `  }\n\n`;

  // Add methods
  code += methods.join('\n');

  code += `}\n`;

  // Write the generated POM to a file
  const filePath = path.resolve(__dirname, `../pages/${pageName}.page.ts`); // Standardized file name
  try {
    // Check if the file already exists
    if (fs.existsSync(filePath)) {
      console.log(`File already exists: ${filePath}. Overwriting...`);
    }

    fs.writeFileSync(filePath, code);
    console.log(`POM generated successfully at: ${filePath}`);
  } catch (error) {
    console.error(`Failed to write POM to file: ${filePath}`, error);
    throw error;
  }

  return code;
}