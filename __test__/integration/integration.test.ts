import { extensionID, displayedAccessToken } from '../../src/js/static/constants';
import puppeteer from 'puppeteer';
import path from 'path';

declare global {
  var __BROWSER__: puppeteer.Browser;
}

let browser: puppeteer.Browser | undefined;
let page: puppeteer.Page | undefined;

const url = (file: string) => `chrome-extension://${extensionID}/${file}`;

// Helper function to wait for element
const assertPage = () => {
  if (!page) throw new Error('Page not initialized');
  return page;
};

const waitForElement = async (selector: string) => {
  await assertPage().waitForSelector(selector, { visible: true });
};

// readProp('.password', 'value', 1)
// will run
// document.querySelectorAll('.password')[1].value
// and return the value of the second node matching the selector '.password'.
const readProp = async (query: string, prop: string, index = 0) => (
  assertPage().evaluate((query, prop, index) => (
    document.querySelectorAll(query)[index][prop]
  ), query, prop, index)
);

// Generate unique profile directory for each test run
const getProfileDir = () => `/tmp/chrome-test-profile-${Date.now()}`;
let profileDir: string;

const setup = async () => {
  try {
    // Ensure clean state
    await teardown().catch(() => {/* ignore cleanup errors */});
    profileDir = getProfileDir();
    const extensionPath = path.join(__dirname, '../../dist');
    const pathToExtension = path.resolve(extensionPath);
    
    // Set extension path for jest-puppeteer config
    process.env.EXTENSION_PATH = pathToExtension;
    
    /* tslint:disable-next-line:no-console */
    console.log('Launching browser with profile:', profileDir);
    
    // Use the global browser instance from jest-puppeteer
    browser = __BROWSER__;
    if (!browser) {
      throw new Error('Browser not initialized by jest-puppeteer');
    }
    
    // Create a new incognito context
    const context = await browser.createIncognitoBrowserContext();
    page = await context.newPage();

    /* tslint:disable-next-line:no-console */
    console.log('Browser launched, waiting for targets...');

    /* tslint:disable-next-line:no-console */
    console.log('Waiting for browser and extension targets...');

    // Wait for both browser and extension targets with enhanced logging
    const waitForTarget = async (predicate: (target: puppeteer.Target) => boolean, timeout: number) => {
      if (!browser) {
        throw new Error('Browser not initialized');
      }
      const startTime = Date.now();
      let lastTargetCount = 0;
      
      while (Date.now() - startTime < timeout) {
        try {
          const targets = await browser.targets();
          if (targets.length !== lastTargetCount) {
            /* tslint:disable-next-line:no-console */
            console.log(`Found ${targets.length} targets:`, targets.map((target: puppeteer.Target) => ({ type: target.type(), url: target.url() })));
            lastTargetCount = targets.length;
          }
          
          const target = targets.find(predicate);
          if (target) {
            /* tslint:disable-next-line:no-console */
            console.log('Target found:', { type: target.type(), url: target.url() });
            return target;
          }
          
          // Log every 5 seconds if target not found
          if ((Date.now() - startTime) % 5000 < 1000) {
            /* tslint:disable-next-line:no-console */
            console.log(`Waiting for target... (${Math.round((Date.now() - startTime) / 1000)}s elapsed)`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          /* tslint:disable-next-line:no-console */
          console.error('Error while waiting for target:', error);
          // Continue trying until timeout
        }
      }
      const availableTargets = await browser.targets();
      const targetInfo = availableTargets.map((target: puppeteer.Target) => ({
        type: target.type(),
        url: target.url()
      }));
      throw new Error(`Target not found within ${timeout}ms. Available targets: ${JSON.stringify(targetInfo)}`);
    };

    /* tslint:disable-next-line:no-console */
    console.log('Waiting for browser target (60s timeout)...');
    await waitForTarget(target => target.type() === 'browser', 60000);

    /* tslint:disable-next-line:no-console */
    console.log('Browser target found, waiting for service worker (60s timeout)...');
    const extensionTarget = await waitForTarget(target => target.type() === 'service_worker', 60000);

    /* tslint:disable-next-line:no-console */
    console.log('Found targets:', await Promise.resolve(browser.targets())
      .then((targets: puppeteer.Target[]) =>
        targets.map((target: puppeteer.Target) => ({
          type: target.type(),
          url: target.url(),
        })),
      ));

    /* tslint:disable-next-line:no-console */
    console.log('Extension service worker found, getting extension ID...');

    // Get extension ID from service worker URL
    const partialExtensionUrl = extensionTarget.url() || '';
    const [,, extensionId] = partialExtensionUrl.split('/');

    if (!extensionId) {
      throw new Error('Failed to extract extension ID from service worker URL');
    }

    /* tslint:disable-next-line:no-console */
    console.log('Extension ID obtained:', extensionId);

    /* tslint:disable-next-line:no-console */
    console.log('Creating new page...');
    try {
      page = await browser.newPage();
      if (!page) {
        throw new Error('Failed to create new page');
      }
      /* tslint:disable-next-line:no-console */
      console.log('Page created successfully');
    } catch (error) {
      /* tslint:disable-next-line:no-console */
      console.error('Error creating page:', error);
      throw error;
    }

    // Configure longer timeout and wait for network idle
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    // Wait for the extension to be properly loaded
    await page.waitForTimeout(2000);

    // Handle dialogs
    page.on('dialog', async dialog => dialog.dismiss());

    // Verify page is ready
    await page.evaluate(() => document.readyState).then(readyState => {
      if (readyState !== 'complete') {
        throw new Error('Page not ready');
      }
    });

  } catch (error) {
    /* tslint:disable-next-line:no-console */
    console.error('Setup failed:', error);
    // Clean up if setup fails
    if (browser) {
      await browser.close().catch(() => {});
    }
    throw error;
  }
};

const teardown = async () => {
  try {
    try {
      // Close all pages first
      if (page) {
        await page.removeAllListeners();
        await page.close().catch(() => { /* ignore page close errors */ });
      }

      if (browser) {
        // Get all pages and close them
        const pages = await browser.pages().catch(() => []);
        if (pages.length > 0) {
          await Promise.all(
            pages.map(p => p.close().catch(() => { /* ignore page close errors */ })),
          );
        }

        // Only close the context, not the browser (jest-puppeteer manages the browser)
        if (browser) {
          const currentBrowser = browser; // Capture in local scope for type safety
          const contexts = await currentBrowser.browserContexts();
          await Promise.all(
            contexts
              .filter(context => context !== currentBrowser.defaultBrowserContext())
              .map(context => context.close().catch(() => { /* ignore context close errors */ }))
          ).catch(err => {
            console.error('Error closing browser contexts:', err);
          });
        }
      }
    } catch (error) {
      /* tslint:disable-next-line:no-console */
      console.error('Error during browser cleanup:', error);
    }
  } catch (e) {
    // Ignore browser cleanup errors
  } finally {
    page = undefined;
    browser = undefined;

    // Clean up profile directory
    if (profileDir) {
      await new Promise<void>((resolve) => {
        const { exec } = require('child_process');
        exec(`rm -rf "${profileDir}"`, (error: Error | null) => {
          if (error) {
            /* tslint:disable-next-line:no-console */
            console.error('Failed to clean up profile directory:', error);
          }
          resolve();
        });
      });
    }
  }
};

// Increase timeout for integration tests
jest.setTimeout(180000); // Increase overall test timeout to 3 minutes

// Add global error handler for unhandled promise rejections
process.on('unhandledRejection', (error) => {
  /* tslint:disable-next-line:no-console */
  console.error('Unhandled Promise Rejection:', error);
  process.exit(1); // Force exit on unhandled rejections
});

describe('integration test', () => {
  beforeAll(async () => {
    try {
      /* tslint:disable-next-line:no-console */
      console.log('Starting test suite setup...');
      // Kill any existing Chrome processes
      await new Promise<void>((resolve) => {
        const { exec } = require('child_process');
        exec('pkill -f chrome', () => {
          exec('pkill -f chromium', () => {
            resolve();
          });
        });
      });

      await setup();
      /* tslint:disable-next-line:no-console */
      console.log('Setup completed, verifying browser state...');
      if (!browser) {
        throw new Error('Browser not initialized after setup');
      }
      if (!page) {
        throw new Error('Page not initialized after setup');
      }
      /* tslint:disable-next-line:no-console */
      console.log('Browser and page verified.');
    } catch (error) {
      /* tslint:disable-next-line:no-console */
      console.error('beforeAll setup failed:', error);
      await teardown().catch(e => {
        /* tslint:disable-next-line:no-console */
        console.error('Teardown after setup failure:', e);
      });
      throw error;
    }
  });

  beforeEach(async () => {
    try {
      /* tslint:disable-next-line:no-console */
      console.log('Starting test case setup...');
      if (!page || !browser) {
        /* tslint:disable-next-line:no-console */
        console.log('Page or browser not available, attempting recreation...');
        page = await browser?.newPage();
        if (!page) {
          throw new Error('Failed to create new page');
        }
      }
      // Reset page state
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      }).catch(() => {/* ignore storage clear errors */});
      // Wait for page to be ready
      await page.waitForFunction(() => document.readyState === 'complete')
        .catch(() => {
          /* tslint:disable-next-line:no-console */
          console.log('Page ready state check failed');
        });
      /* tslint:disable-next-line:no-console */
      console.log('Test case setup completed.');
    } catch (error) {
      /* tslint:disable-next-line:no-console */
      console.error('beforeEach setup failed:', error);
      throw error;
    }
  });

  afterEach(async () => {
    try {
      /* tslint:disable-next-line:no-console */
      console.log('Starting test case cleanup...');
      if (page) {
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        }).catch(() => {/* ignore storage clear errors */});
      }
      /* tslint:disable-next-line:no-console */
      console.log('Test case cleanup completed.');
    } catch (error) {
      /* tslint:disable-next-line:no-console */
      console.error('afterEach cleanup failed:', error);
    }
  });

  afterAll(async () => {
    try {
      /* tslint:disable-next-line:no-console */
      console.log('Starting test suite cleanup...');
      await teardown();
      // Force kill any remaining Chrome processes
      await new Promise<void>((resolve) => {
        const { exec } = require('child_process');
        exec('pkill -f chrome', () => {
          exec('pkill -f chromium', () => {
            resolve();
          });
        });
      });
      /* tslint:disable-next-line:no-console */
      console.log('Test suite cleanup completed.');
    } catch (error) {
      /* tslint:disable-next-line:no-console */
      console.error('afterAll teardown failed:', error);
      throw error;
    }
  });

  describe('options', () => {
    beforeEach(async () => {
      const currentPage = assertPage();
      await currentPage.goto(url('options.html'), {
        waitUntil: ['networkidle2', 'domcontentloaded', 'load'],
        timeout: 30000,
      });
      await currentPage.waitForTimeout(1000); // Ensure page is stable
    });

    it('navigates to the options page', async () => {
      const currentPage = assertPage();
      expect(await currentPage.title()).toMatch('GitHub Pull Request Counter');
      expect(currentPage.url()).toEqual(url('options.html'));
    });

    it('has the correct content', async () => {
      const currentPage = assertPage();
      await currentPage.waitForSelector('#link-to-renuo', { visible: true, timeout: 30000 });
      expect(await readProp('#link-to-renuo', 'href')).toEqual('https://www.renuo.ch/');
    });

    it('checkboxes', async () => {
      // Wait for all elements before interacting
      await waitForElement('#review-requested');
      await waitForElement('#all-reviews-done');
      await waitForElement('#all-assigned');
      await waitForElement('button[id="options-save"]');

      const currentPage = assertPage();
      // Reset checkbox states first
      await currentPage.evaluate(() => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        Array.from(checkboxes).forEach((checkbox: Element) => {
          const input = checkbox as HTMLInputElement;
          input.checked = input.id === 'all-assigned' ? false : true;
        });
      });

      // Wait for state to settle
      await currentPage.waitForTimeout(1000);

      // Click checkboxes to toggle their states
      await currentPage.click('#review-requested');
      await currentPage.click('#all-reviews-done');
      await currentPage.click('#all-assigned');
      await currentPage.click('button[id="options-save"]');

      // Navigate and wait for page load
      await currentPage.goto(url('options.html'), { waitUntil: 'networkidle2' });

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

      const currentPage = assertPage();
      // Clear storage and reset input state
      await currentPage.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
        const input = document.querySelector('#account-names') as HTMLInputElement;
        if (input) input.value = '';
      });

      // Ensure clean state before typing
      await currentPage.waitForTimeout(500);

      // Type new value and save with increased delay
      await currentPage.type('input[id=account-names]', 'renuo', { delay: 100 });
      await currentPage.click('button[id="options-save"]');

      try {
        const currentPage = assertPage();
        await currentPage.goto(url('options.html'), { waitUntil: 'networkidle2', timeout: 10000 });
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

        const currentPage = assertPage();
        await currentPage.type('input[id=access-token]', 'ghp_access_token', { delay: 20 });
        await currentPage.click('button[id="options-save"]');

        // Clear any existing token before checking
        await currentPage.evaluate(() => {
          const input = document.querySelector('#access-token') as HTMLInputElement;
          if (input) input.value = '';
        });

        await currentPage.goto(url('options.html'), { waitUntil: 'networkidle2', timeout: 10000 });
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
      jest.setTimeout(60000); // Increase timeout for popup navigation
      try {
        const currentPage = assertPage();
        // Clear state and wait before navigation
        await currentPage.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
        await currentPage.waitForTimeout(1000);

        await currentPage.goto(url('popup.html'), {
          waitUntil: ['networkidle2', 'domcontentloaded', 'load'],
          timeout: 30000,
        });

        // Wait for extension to initialize with better error handling
        await currentPage.waitForFunction(
          () => {
            const loaded = document.querySelector('.pull-requests-loaded');
            const error = document.querySelector('.error');
            return loaded !== null || error !== null;
          },
          { timeout: 30000 },
        );

        // Check for error state
        const hasError = await currentPage.evaluate(() =>
          document.querySelector('.error') !== null,
        );
        if (hasError) {
          throw new Error('Popup loaded in error state');
        }

        expect(currentPage.url()).toEqual(url('popup.html'));

        // Additional wait to ensure content is fully loaded
        await currentPage.waitForTimeout(2000);
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

      // Wait for links to be available
      await waitForElement('.link-container > a');

      // Check links
      expect(await readProp('.link-container > a', 'href', 0)).toEqual(link(0));
      expect(await readProp('.link-container > a', 'href', 1)).toEqual(link(1));
      expect(await readProp('.link-container > a', 'href', 2)).toEqual(link(2));
    });

    it('has the correct subtitles', async () => {
      const subtitle = (index: number) => `renuo/github-pull-request-counter<b> #${index + 1}</b>`;

      // Wait for subtitles to be available
      await waitForElement('.link-container > .subdescription');

      // Check subtitles
      expect(await readProp('.link-container > .subdescription', 'innerHTML', 0)).toContain(subtitle(0));
      expect(await readProp('.link-container > .subdescription', 'innerHTML', 1)).toContain(subtitle(1));
      expect(await readProp('.link-container > .subdescription', 'innerHTML', 2)).toContain(subtitle(2));
    });
  });
});
