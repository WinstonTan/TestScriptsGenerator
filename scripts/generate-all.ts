import { generateTestCase } from '../crawler/test-generator';
import { generatePOM } from '../crawler/pom-generator';
import * as fs from 'fs';
import * as path from 'path';

(async () => {
  try {
    // Define paths for POM and test files
    const pomFilePath = path.resolve(__dirname, '../pages/LoginPage.page.ts');
    const testFilePath = path.resolve(__dirname, '../tests/login.spec.ts');

    // Generate POM
    console.log('Generating POM...');
    const elements = {
      inputs: ['#username', '#password'],
      buttons: ['#login-button'],
      dropdowns: [],
      checkboxes: [],
      radios: [],
      links: ['#forgot-password'],
    };
    const pomCode = await generatePOM('LoginPage', elements);
    fs.writeFileSync(pomFilePath, pomCode);
    console.log(`POM generated at: ${pomFilePath}`);

    // Generate Test Case
    console.log('Generating Test Case...');
    await generateTestCase(pomFilePath, testFilePath);
    console.log(`Test case generated at: ${testFilePath}`);
  } catch (error) {
    console.error('Error generating files:', error);
  }
})();