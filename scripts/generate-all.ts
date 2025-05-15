import { generateTestCase } from '../crawler/test-generator';
import { generatePOM } from '../crawler/pom-generator';
import { crawlPage } from '../crawler/explorer';
import * as fs from 'fs';
import * as path from 'path';

async function generateAndSavePOM(pomName: string, elements: {
  inputs: string[];
  buttons: string[];
  dropdowns: string[];
  checkboxes: string[];
  radios: string[];
  links: string[];
}, pomFilePath: string) {
  console.log('Generating POM...');
  const pomCode = await generatePOM(pomName, elements);
  fs.writeFileSync(pomFilePath, pomCode);
  console.log(`POM generated at: ${pomFilePath}`);
}

async function main() {
  try {
    // Define the base URL to crawl
    const url = 'https://www.lambdatest.com/selenium-playground/input-form-demo';

    // Crawl the page to get elements
    const crawledElements = await crawlPage(url);
    console.log('Crawled elements:', crawledElements);

    // Build the elements object as arrays of selector strings
    const elements = {
      inputs: crawledElements.filter((el: any) => el.type === 'input').map((el: any) => el.selector),
      buttons: crawledElements.filter((el: any) => el.type === 'button').map((el: any) => el.selector),
      dropdowns: crawledElements.filter((el: any) => el.type === 'dropdown').map((el: any) => el.selector),
      checkboxes: crawledElements.filter((el: any) => el.type === 'checkbox').map((el: any) => el.selector),
      radios: crawledElements.filter((el: any) => el.type === 'radio').map((el: any) => el.selector),
      links: crawledElements.filter((el: any) => el.type === 'link').map((el: any) => el.selector),
    };

    // Define paths for POM and test files
    const pomName = 'samplePage';
    const pomFilePath = path.resolve(__dirname, '../pages/sample.page.ts');
    const testFilePath = path.resolve(__dirname, '../tests/sample.spec.ts');

    // Generate and save POM
    await generateAndSavePOM(pomName, elements, pomFilePath);

    // Generate Test Case
    console.log('Generating Test Case...');
    await generateTestCase(pomFilePath, testFilePath);
    console.log(`Test case generated at: ${testFilePath}`);
  } catch (error) {
    console.error('Error generating files:', error);
  }
}

main();