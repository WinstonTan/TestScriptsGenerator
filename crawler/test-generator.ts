import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

// Dynamically import the generated POM class
async function loadPOMClass(pomFilePath: string): Promise<any> {
  const pomModule = await import(pomFilePath);
  const className = Object.keys(pomModule)[0]; // Assume the first export is the POM class
  return pomModule[className];
}

// Generate a sample test case
export async function generateTestCase(pomFilePath: string, testFilePath: string): Promise<void> {
  console.log(`Generating test case for POM: ${pomFilePath}`);
  const POMClass = await loadPOMClass(pomFilePath);
  const pomInstanceName = POMClass.name.charAt(0).toLowerCase() + POMClass.name.slice(1); // e.g., loginPage

  // Inspect the POM class to detect data fields and methods
  const pomMethods = Object.getOwnPropertyNames(POMClass.prototype).filter(
    (method) => method !== 'constructor'
  );

  // Remove the .ts extension from the import path
  const relativePomPath = path
    .relative(path.dirname(testFilePath), pomFilePath)
    .replace(/\\/g, '/')
    .replace(/\.ts$/, ''); // Remove .ts extension

  // Generate the test case
  const testCode = `
import { test, expect } from '@playwright/test';
import { ${POMClass.name} } from '${relativePomPath}';

test.describe('${POMClass.name} Tests', () => {
  test('should interact with data fields and assert results', async ({ page }) => {
    const ${pomInstanceName} = new ${POMClass.name}(page);

    // Interact with data fields
    ${pomMethods
      .filter((method) => method.startsWith('fill'))
      .map((method) => `await ${pomInstanceName}.${method}('sampleValue');`)
      .join('\n    ')}

    ${pomMethods
      .filter((method) => method.startsWith('click'))
      .map((method) => `await ${pomInstanceName}.${method}();`)
      .join('\n    ')}

    // Add assertions
    await expect(page).toHaveURL(/expected-url/);
  });
});
`;

  // Write the test case to the specified file
  try {
    fs.writeFileSync(testFilePath, testCode);
    console.log(`Test case generated successfully at: ${testFilePath}`);
  } catch (error) {
    console.error(`Failed to write test case to file: ${testFilePath}`, error);
    throw error;
  }
}

// Example usage
(async () => {
  const pomFilePath = path.resolve(__dirname, '../pages/LoginPage.page.ts'); // Path to the generated POM
  const testFilePath = path.resolve(__dirname, '../tests/login.spec.ts'); // Path to the generated test file
  await generateTestCase(pomFilePath, testFilePath);
})();