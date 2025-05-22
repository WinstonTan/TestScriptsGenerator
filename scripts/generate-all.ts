import { generateTestCase } from '../crawler/test-generator';
import { generatePOM } from '../crawler/pom-generator';
import { crawlPage } from '../crawler/explorer';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
  try {
    // Fetch the base URL and POM name from .env
    const url = process.env.BASE_URL;
    const pomBase = process.env.POM_NAME || 'sample';

    if (!url) {
      throw new Error('BASE_URL is not defined in the environment variables.');
    }

    // Crawl the page to get all detected elements
    const detectedElements = await crawlPage(url);
    console.log('Crawled elements:', detectedElements);

    // Define paths for POM and test files using POM_NAME
    const pomName = `${pomBase}Page`;
    const pomFilePath = path.resolve(__dirname, `../pages/${pomBase}.page.ts`);
    const testFilePath = path.resolve(__dirname, `../tests/${pomBase}.spec.ts`);

    // Generate and save POM
    console.log('Generating POM...');
    const pomCode = await generatePOM(pomName, detectedElements);
    fs.writeFileSync(pomFilePath, pomCode);
    console.log(`POM generated at: ${pomFilePath}`);

    // Generate Test Case
    console.log('Generating Test Case...');
    await generateTestCase(pomFilePath, testFilePath);
    console.log(`Test case generated at: ${testFilePath}`);
  } catch (error) {
    console.error('Error generating files:', error);
  }
}

main();