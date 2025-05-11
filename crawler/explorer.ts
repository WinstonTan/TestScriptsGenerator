import { chromium } from 'playwright';

export type DetectedElements = {
  buttons: string[];
  inputs: string[];
  dropdowns: string[];
  checkboxes: string[];
  radios: string[];
  links: string[];
};

export async function crawlPage(url: string): Promise<DetectedElements> {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto(url);

    // Wait for 5 seconds to allow the page to load
    await page.waitForTimeout(5000);

    const getSelectors = async (selector: string): Promise<string[]> => {
      const elements = await page.$$(selector);
      const selectors: string[] = [];

      for (const element of elements) {
        const id = await element.getAttribute('id');
        const name = await element.getAttribute('name');
        const testId = await element.getAttribute('data-testid');
        const placeholder = await element.getAttribute('placeholder');
        const ariaLabel = await element.getAttribute('aria-label');
        const innerText = await element.evaluate((el) => el.textContent?.trim());

        const meaningfulSelector =
          (id && `#${id}`) ||
          (name && `[name="${name}"]`) ||
          (testId && `[data-testid="${testId}"]`) ||
          (placeholder && `[placeholder="${placeholder}"]`) ||
          (ariaLabel && `[aria-label="${ariaLabel}"]`) ||
          (innerText && `text="${innerText}"`);

        if (meaningfulSelector) {
          selectors.push(meaningfulSelector);
        }
      }

      return selectors;
    };

    const detectedElements: DetectedElements = {
      buttons: await getSelectors('[data-testid="button"], button, [role="button"], input[type="submit"], .button'),
      inputs: await getSelectors('[data-testid="input"], input:not([type="hidden"]), textarea, [data-se*="input"]'),
      dropdowns: await getSelectors('[data-testid="dropdown"], select, [role="combobox"]'),
      checkboxes: await getSelectors('[data-testid="checkbox"], input[type="checkbox"], [role="checkbox"]'),
      radios: await getSelectors('[data-testid="radio"], input[type="radio"], [role="radio"]'),
      links: await getSelectors('[data-testid="link"], a[href], [role="link"]'),
    };

    return detectedElements;
  } finally {
    await browser.close();
  }
}