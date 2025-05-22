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

    const detected: DetectedElement[] = [];

    // Helper to check if an element is visible
    async function isVisible(element: any): Promise<boolean> {
      return await element.evaluate((el: HTMLElement) => {
        const style = window.getComputedStyle(el);
        return (
          style &&
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          el.offsetParent !== null &&
          el.offsetWidth > 0 &&
          el.offsetHeight > 0
        );
      });
    }

    // Crawl input elements (text, email, password, etc.)
    const inputElements = await page.$$('input');
    for (const element of inputElements) {
      if (!(await isVisible(element))) continue;
      const type = (await element.getAttribute('type')) || 'text';
      let detectedType = '';
      if (['text', 'email', 'password', 'search', 'tel', 'url'].includes(type)) {
        detectedType = 'input_text';
      } else if (type === 'checkbox') {
        detectedType = 'checkbox';
      } else if (type === 'radio') {
        detectedType = 'radio';
      } else if (type === 'submit' || type === 'button') {
        detectedType = 'button';
      } else {
        continue;
      }
      const name = await element.getAttribute('name');
      const id = await element.getAttribute('id');
      const label = name || id || undefined;
      const selector =
        (id && `#${id}`) ||
        (name && `[name="${name}"]`) ||
        (await element.getAttribute('placeholder') && `[placeholder="${await element.getAttribute('placeholder')}"]`);
      if (selector) {
        detected.push({ type: detectedType, selector, label });
      }
    }

    // Crawl textarea elements
    const textareas = await page.$$('textarea');
    for (const element of textareas) {
      if (!(await isVisible(element))) continue;
      const name = await element.getAttribute('name');
      const id = await element.getAttribute('id');
      const label = name || id || undefined;
      const selector =
        (id && `#${id}`) ||
        (name && `[name="${name}"]`) ||
        (await element.getAttribute('placeholder') && `[placeholder="${await element.getAttribute('placeholder')}"]`);
      if (selector) {
        detected.push({ type: 'textarea', selector, label });
      }
    }

    // Crawl select (dropdown) elements
    const selects = await page.$$('select');
    for (const element of selects) {
      if (!(await isVisible(element))) continue;
      const name = await element.getAttribute('name');
      const id = await element.getAttribute('id');
      const label = name || id || undefined;
      const selector =
        (id && `#${id}`) ||
        (name && `[name="${name}"]`);
      if (selector) {
        detected.push({ type: 'dropdown', selector, label });
      }
    }

    // Crawl button elements
    const buttons = await page.$$('button');
    for (const element of buttons) {
      if (!(await isVisible(element))) continue;
      const name = await element.getAttribute('name');
      const id = await element.getAttribute('id');
      const label = name || id || undefined;
      const selector =
        (id && `#${id}`) ||
        (name && `[name="${name}"]`);
      if (selector) {
        detected.push({ type: 'button', selector, label });
      }
    }

    // Crawl visible links
    const links = await page.$$('a[href]');
    for (const element of links) {
      if (!(await isVisible(element))) continue;
      const text = await element.innerText();
      const selector = `text="${text.trim()}"`;
      detected.push({ type: 'link', selector, label: text.trim() });
    }

    return detected;
  } finally {
    await browser.close();
  }
}