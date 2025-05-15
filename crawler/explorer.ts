import { chromium } from 'playwright';

export type DetectedElement = {
  type: string;
  selector: string;
  label?: string;
};

export async function crawlPage(url: string): Promise<DetectedElement[]> {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto(url);
    await page.waitForTimeout(5000);

    // Helper to extract a meaningful selector and label
    const extractSelector = async (element: any) => {
      const id = await element.getAttribute('id');
      const name = await element.getAttribute('name');
      const testId = await element.getAttribute('data-testid');
      const placeholder = await element.getAttribute('placeholder');
      const ariaLabel = await element.getAttribute('aria-label');
      const innerText = await element.evaluate((el: any) => el.textContent?.trim());

      const selector =
        (id && `#${id}`) ||
        (name && `[name="${name}"]`) ||
        (testId && `[data-testid="${testId}"]`) ||
        (placeholder && `[placeholder="${placeholder}"]`) ||
        (ariaLabel && `[aria-label="${ariaLabel}"]`) ||
        (innerText && `text="${innerText}"`);

      const label = ariaLabel || placeholder || innerText || name || id || testId || undefined;
      return { selector, label };
    };

    // Define all interactable types and their selectors
    const interactables = [
      { type: 'input', selector: 'input:not([type="hidden"])' },
      { type: 'button', selector: 'button, input[type="button"], input[type="submit"], [role="button"]' },
      { type: 'link', selector: 'a[href], [role="link"]' },
      { type: 'slider', selector: 'input[type="range"], [role="slider"]' },
      { type: 'textarea', selector: 'textarea' },
      { type: 'checkbox', selector: 'input[type="checkbox"], [role="checkbox"]' },
      { type: 'radio', selector: 'input[type="radio"], [role="radio"]' },
      { type: 'dropdown', selector: 'select, [role="combobox"]' },
    ];

    const detected: DetectedElement[] = [];

    for (const { type, selector } of interactables) {
      const elements = await page.$$(selector);
      for (const element of elements) {
        const { selector: sel, label } = await extractSelector(element);
        if (sel) {
          detected.push({ type, selector: sel, label });
        }
      }
    }

    console.log('Detected elements:', detected);
    return detected;
  } finally {
    await browser.close();
  }
}