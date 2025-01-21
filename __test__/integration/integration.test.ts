import { extensionID, displayedAccessToken } from '../../src/js/static/constants';
import puppeteer from 'puppeteer';
import path from 'path';

let browser: puppeteer.Browser;
let page: puppeteer.Page;

const url = (file: string) => `chrome-extension://${extensionID}/${file}`;

// Helper function to wait for element
const waitForElement = async (selector: string) => {
  await page.waitForSelector(selector, { visible: true });
};

// readProp('.password', 'value', 1)
// will run
// document.querySelectorAll('.password')[1].value
// and return the value of the second node matching the selector '.password'.
const readProp = (query: string, prop: string, index = 0) => (
  page.evaluate((query, prop, index) => (
    document.querySelectorAll(query)[index][prop]
  ), query, prop, index)
);

const setup = async () => {
  const extensionPath = path.join(__dirname, '../../dist');

  const pathToExtension = path.resolve(extensionPath);
  browser = await puppeteer.launch({
    product: 'chrome',
    headless: true,
    ignoreHTTPSErrors: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote',
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      '--user-data-dir=/tmp/chrome-test-profile',
    ],
    pipe: false,
  });

  const targets = await browser.targets();
  const extensionTarget = targets.find(target => target.type() === 'service_worker');
  const partialExtensionUrl = extensionTarget?.url() || '';
  const [,, extensionId] = partialExtensionUrl.split('/');

  page = await browser.newPage();

  // Configure longer timeout and wait for network idle
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(10000);

  // Wait for the extension to be properly loaded
  await page.waitForTimeout(2000);

  // Handle dialogs
  page.on('dialog', async dialog => dialog.dismiss());

  // Initialize page timeouts
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(10000);
};

const teardown = async () => {
  if (page) {
    try {
      await page.close();
    } catch (e) {
      // Ignore page close errors during teardown
    }
  }
  if (browser) {
    try {
      await browser.close();
    } catch (e) {
      // Ignore browser close errors during teardown
    }
  }
};

describe('integration test', () => {
  beforeAll(setup);
  afterAll(teardown);
  afterEach(async () => {
    // Clean up any dialogs or stale states between tests
    try {
      await page.evaluate(() => window.localStorage.clear());
    } catch (e) {
      // Ignore localStorage clear errors between tests
    }
  });

  describe('options', () => {
    beforeEach(async () => {
      await page.goto(url('options.html'), { waitUntil: 'networkidle2' });
    });

    it('navigates to the options page', async () => {
      expect(page.title()).resolves.toMatch('GitHub Pull Request Counter');
      expect(page.url()).toEqual(url('options.html'));
    });

    it('has the correct content', async () => {
      expect(await readProp('#link-to-renuo', 'href')).toEqual('https://www.renuo.ch/');
    });

    it('checkboxes', async () => {
      // Wait for all elements before interacting
      await waitForElement('#review-requested');
      await waitForElement('#all-reviews-done');
      await waitForElement('#all-assigned');
      await waitForElement('button[id="options-save"]');

      // Click checkboxes
      await page.click('#review-requested');
      await page.click('#all-reviews-done');
      await page.click('#all-assigned');
      await page.click('button[id="options-save"]');

      // Navigate and wait for page load
      await page.goto(url('options.html'), { waitUntil: 'networkidle2' });

      // Wait for elements to be available after navigation
      await waitForElement('#review-requested');
      await waitForElement('#team-review-requested');
      await waitForElement('#no-review-requested');
      await waitForElement('#all-reviews-done');
      await waitForElement('#missing-assignee');
      await waitForElement('#all-assigned');

      // Check states
      expect(await readProp('#review-requested', 'checked')).toEqual(false);
      expect(await readProp('#team-review-requested', 'checked')).toEqual(true);
      expect(await readProp('#no-review-requested', 'checked')).toEqual(true);
      expect(await readProp('#all-reviews-done', 'checked')).toEqual(false);
      expect(await readProp('#missing-assignee', 'checked')).toEqual(true);
      expect(await readProp('#all-assigned', 'checked')).toEqual(true); // Because it is false by default
    });

    it('scope', async () => {
      // Wait for elements before interacting
      await waitForElement('input[id=account-names]');
      await waitForElement('button[id="options-save"]');

      // Clear any existing text before typing
      await page.evaluate(() => {
        const input = document.querySelector('#account-names') as HTMLInputElement;
        if (input) input.value = '';
      });

      await page.type('input[id=account-names]', 'renuo', { delay: 20 });
      await page.click('button[id="options-save"]');

      try {
        await page.goto(url('options.html'), { waitUntil: 'networkidle2', timeout: 10000 });
        await waitForElement('#account-names');
        expect(await readProp('#account-names', 'value')).toEqual('renuo');
      } catch (e: unknown) {
        const error = e instanceof Error ? e.message : String(e);
        throw new Error(`Account names test failed: ${error}`);
      }
    });

    it('access token', async () => {
      try {
        // Wait for elements before interacting
        await waitForElement('input[id=access-token]');
        await waitForElement('button[id="options-save"]');

        await page.type('input[id=access-token]', 'ghp_access_token', { delay: 20 });
        await page.click('button[id="options-save"]');

        // Clear any existing token before checking
        await page.evaluate(() => {
          const input = document.querySelector('#access-token') as HTMLInputElement;
          if (input) input.value = '';
        });

        await page.goto(url('options.html'), { waitUntil: 'networkidle2', timeout: 10000 });
        await waitForElement('#access-token');

        expect(await readProp('#access-token', 'value')).toEqual(displayedAccessToken);
      } catch (e: unknown) {
        const error = e instanceof Error ? e.message : String(e);
        throw new Error(`Access token test failed: ${error}`);
      }
    });
  });

  describe('popup', () => {
    it('navigates to the popup', async () => {
      jest.setTimeout(30000); // Increase timeout for popup navigation
      try {
        await page.goto(url('popup.html'), {
          waitUntil: ['networkidle2', 'domcontentloaded'],
          timeout: 15000,
        });
        // Wait for extension to initialize and content to load
        await page.waitForFunction(
          () => document.querySelector('.pull-requests-loaded') !== null,
          { timeout: 10000 },
        );
        expect(page.url()).toEqual(url('popup.html'));
      } catch (e: unknown) {
        const error = e instanceof Error ? e.message : String(e);
        throw new Error(`Popup navigation test failed: ${error}`);
      }
    });

    it('has the correct content', async () => {
      // Wait for content to be loaded
      await waitForElement('#link-to-renuo');
      await waitForElement('.title');

      // Verify content
      expect(await readProp('#link-to-renuo', 'href')).toEqual('https://www.renuo.ch/');
      expect(await readProp('.title', 'innerHTML', 0)).toEqual('I must review');
      expect(await readProp('.title', 'innerHTML', 1)).toEqual('No review requested');
      expect(await readProp('.title', 'innerHTML', 2)).toEqual('All reviews done');
      expect(await readProp('.title', 'innerHTML', 3)).toEqual('Missing Assignee');
      expect(await readProp('.title', 'innerHTML', 4)).toEqual('Assigned to me');
    });

    it('has the correct links', async () => {
      const link = (index: number) => `https://github.com/renuo/github-pull-request-counter/pull/${index + 1}`;

      expect(await readProp('.pr-link', 'href', 0)).toEqual(link(0));
      expect(await readProp('.pr-link', 'href', 1)).toEqual(link(1));
      expect(await readProp('.pr-link', 'href', 2)).toEqual(link(2));
    });
  });
});
