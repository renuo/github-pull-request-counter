import { extensionID, displayedAccessToken } from '../../src/js/static/constants';
import puppeteer from 'puppeteer';
import path from 'path';

let browser: puppeteer.Browser;
let page: puppeteer.Page;

const TIMEOUT = 60000; // 60 seconds timeout for slower CI environments
const url = (file: string) => `chrome-extension://${extensionID}/${file}`;

// readProp('.password', 'value', 1)
// will run
// document.querySelectorAll('.password')[1].value
// and return the value of the second node matching the selector '.password'.
const readProp = async (query: string, prop: string, index: number = 0): Promise<string> => (
  page.evaluate((query, prop, index) => (
    document.querySelectorAll(query)[index][prop]
  ), query, prop, index)
);

const setup = async (): Promise<void> => {
  const extensionPath = path.join(__dirname, '../../dist');

  const isHeadless = process.env.PUPPETEER_HEADLESS?.toLowerCase() !== 'false';
  const isCI = process.env.CI === 'true';

  const args = [
    `--disable-extensions-except=${extensionPath}`,
    ...(isCI ? [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ] : []),
  ];

  browser = await puppeteer.launch({
    headless: isHeadless,
    ignoreHTTPSErrors: true,
    args,
  });

  page = await browser.newPage();

  page.on('dialog', async (dialog: puppeteer.Dialog) => dialog.dismiss());
};

const teardown = async (): Promise<void> => {
  await browser.close();
};

describe('integration test', () => {
  beforeAll(async () => {
    jest.setTimeout(30000); // Increase timeout to 30 seconds
    await setup();
  });
  afterAll(teardown);

  describe('options', () => {
    const TIMEOUT = 60000; // 60 seconds timeout for slower CI environments

    beforeEach(async () => {
      // Navigate to options page and wait for initial load
      await page.goto(url('options.html'), { waitUntil: 'networkidle0', timeout: TIMEOUT });
      
      // Wait for core UI elements
      try {
        await page.waitForSelector('#link-to-renuo', { timeout: TIMEOUT });
        await page.waitForFunction(() => document.readyState === 'complete', { timeout: TIMEOUT });
      } catch (error) {
        console.error('Failed to load options page:', error);
        throw error;
      }
    });

    it('navigates to the options page', async () => {
      const title = await page.title();
      expect(title).toMatch('GitHub Pull Request Counter');
      expect(page.url()).toEqual(url('options.html'));
    });

    it('has the correct content and styling', async () => {
      // Basic content verification
      const renuoLink = await readProp('#link-to-renuo', 'href');
      expect(renuoLink).toEqual('https://www.renuo.ch/');

      // Wait for dynamic content with better error handling
      try {
        // Wait for core container
        await page.waitForSelector('.pull-requests-loaded', { timeout: TIMEOUT });
        
        // Wait for PR list elements
        await Promise.all([
          page.waitForSelector('.link-container', { timeout: TIMEOUT }),
          page.waitForSelector('.pr-status-badge', { timeout: TIMEOUT }),
          page.waitForSelector('.subdescription', { timeout: TIMEOUT }),
        ]);

        // Verify GitHub-style layout elements
        const linkContainers = await page.$$('.link-container');
        expect(linkContainers.length).toBeGreaterThan(0);

        const badges = await page.$$('.pr-status-badge');
        expect(badges.length).toBeGreaterThan(0);

        const subdescriptions = await page.$$('.subdescription');
        expect(subdescriptions.length).toBeGreaterThan(0);
      } catch (error) {
        console.error('Failed to verify content:', error);
        throw error;
      }

      // Verify GitHub-style layout elements
      const linkContainers = await page.$$('.link-container');
      expect(linkContainers.length).toBeGreaterThan(0);

      const badges = await page.$$('.pr-status-badge');
      expect(badges.length).toBeGreaterThan(0);

      const subdescriptions = await page.$$('.subdescription');
      expect(subdescriptions.length).toBeGreaterThan(0);
    });

    it('saves checkbox preferences correctly', async () => {
      // Toggle some checkboxes
      await page.click('#review-requested');
      await page.click('#all-reviews-done');
      await page.click('#all-assigned');
      await page.click('button[id="options-save"]');

      // Reload page to verify persistence
      await page.goto(url('options.html'), { waitUntil: 'networkidle2' });

      // Verify checkbox states
      const checkboxStates = {
        '#review-requested': false,
        '#team-review-requested': true,
        '#no-review-requested': true,
        '#all-reviews-done': false,
        '#missing-assignee': true,
        '#all-assigned': true, // Because it is false by default
      };

      for (const [selector, expectedState] of Object.entries(checkboxStates)) {
        expect(await readProp(selector, 'checked')).toEqual(expectedState);
      }
    });

    it('scope', async () => {
      await page.type('input[id=account-names]', 'renuo', { delay: 20 });
      await page.click('button[id="options-save"]');

      await page.goto(url('options.html'), { waitUntil: 'networkidle2' });

      expect(await readProp('#account-names', 'value')).toEqual('renuo');
    });

    it('access token', async () => {
      await page.type('input[id=access-token]', 'ghp_access_token', { delay: 20 });
      await page.click('button[id="options-save"]');

      await page.goto(url('options.html'), { waitUntil: 'networkidle2' });

      expect(await readProp('#access-token', 'value')).toEqual(displayedAccessToken);
    });
  });

  describe('popup', () => {
    beforeEach(async () => {
      // Navigate to popup and wait for initial load
      await page.goto(url('popup.html'), { waitUntil: 'networkidle0', timeout: TIMEOUT });
      
      try {
        // Wait for core container first
        await page.waitForSelector('.pull-requests-loaded', { timeout: TIMEOUT });
        
        // Then wait for PR list elements
        await Promise.all([
          page.waitForSelector('.link-container', { timeout: TIMEOUT }),
          page.waitForSelector('.pr-status-badge', { timeout: TIMEOUT }),
          page.waitForSelector('.subdescription', { timeout: TIMEOUT }),
        ]);
      } catch (error) {
        console.error('Failed to load popup content:', error);
        throw error;
      }
    });

    it('navigates to the popup', async () => {
      expect(page.url()).toEqual(url('popup.html'));
    });

    it('has the correct section titles', async () => {
      expect(await readProp('.title', 'textContent', 0)).toEqual('I must review');
      expect(await readProp('.title', 'textContent', 1)).toEqual('No review requested');
      expect(await readProp('.title', 'textContent', 2)).toEqual('All reviews done');
      expect(await readProp('.title', 'textContent', 3)).toEqual('Missing Assignee');
      expect(await readProp('.title', 'textContent', 4)).toEqual('Assigned to me');
    });

    it('displays status badges for pull requests', async () => {
      const badgeCount = (await page.$$('.pr-status-badge')).length;
      expect(badgeCount).toBeGreaterThan(0);
    });

    it('has the correct pull request links and metadata', async () => {
      const links = await page.$$eval('.pr-link', elements =>
        elements.map(el => (el as HTMLAnchorElement).href),
      );

      // Verify PR links are in ascending order
      expect(links[0]).toContain('/pull/1');
      expect(links[1]).toContain('/pull/2');
      expect(links[2]).toContain('/pull/3');

      // Verify PR metadata
      const subdesc = await readProp('.subdescription', 'textContent', 0);
      expect(subdesc).toContain('renuo/github-pull-request-counter');
      expect(subdesc).toContain('#1');
      expect(subdesc).toContain('opened');
      expect(subdesc).toContain('by');
    });
  });
});
