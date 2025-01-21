import { extensionID, displayedAccessToken } from '../../src/js/static/constants';
import puppeteer from 'puppeteer';
import path from 'path';

let browser: puppeteer.Browser;
let page: puppeteer.Page;

const url = (file: string): string => `chrome-extension://${extensionID}/${file}`;

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

  browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--remote-debugging-port=9222',
      '--remote-debugging-address=0.0.0.0',
      `--disable-extensions-except=${extensionPath}`,
    ],
    pipe: true,
  });

  page = await browser.newPage();

  page.on('dialog', async (dialog: puppeteer.Dialog) => dialog.dismiss());
};

const teardown = async (): Promise<void> => {
  await browser.close();
};

describe('integration test', () => {
  beforeAll(setup);
  afterAll(teardown);

  describe('options', () => {
    it('navigates to the options page', async () => {
      await page.goto(url('options.html'), { waitUntil: 'networkidle2' });
      expect(page.title()).resolves.toMatch('GitHub Pull Request Counter');
      expect(page.url()).toEqual(url('options.html'));
    });

    it('has the correct content', () => {
      expect(readProp('#link-to-renuo', 'href')).resolves.toEqual('https://www.renuo.ch/');
    });

    it('checkboxes', async () => {
      await page.click('#review-requested');
      await page.click('#all-reviews-done');
      await page.click('#all-assigned');
      await page.click('button[id="options-save"]');

      await page.goto(url('options.html'), { waitUntil: 'networkidle2' });

      expect(readProp('#review-requested', 'checked')).resolves.toEqual(false);
      expect(readProp('#team-review-requested', 'checked')).resolves.toEqual(true);
      expect(readProp('#no-review-requested', 'checked')).resolves.toEqual(true);
      expect(readProp('#all-reviews-done', 'checked')).resolves.toEqual(false);
      expect(readProp('#missing-assignee', 'checked')).resolves.toEqual(true);
      expect(readProp('#all-assigned', 'checked')).resolves.toEqual(true); // Because it is false by default
    });

    it('scope', async () => {
      await page.type('input[id=account-names]', 'renuo', { delay: 20 });
      await page.click('button[id="options-save"]');

      await page.goto(url('options.html'), { waitUntil: 'networkidle2' });

      expect(readProp('#account-names', 'value')).resolves.toEqual('renuo');
    });

    it('access token', async () => {
      await page.type('input[id=access-token]', 'ghp_access_token', { delay: 20 });
      await page.click('button[id="options-save"]');

      await page.goto(url('options.html'), { waitUntil: 'networkidle2' });

      expect(readProp('#access-token', 'value')).resolves.toEqual(displayedAccessToken);
    });
  });

  describe('popup', () => {
    it('navigates to the popup', async () => {
      while (await page.evaluate((): boolean => document.querySelector('.pull-requests-loaded') === null)) {
        await page.goto(url('popup.html'), { waitUntil: 'networkidle2' });
      }

      expect(page.url()).toEqual(url('popup.html'));
    });

    it('has the correct content', async () => {
      await expect(readProp('#link-to-renuo', 'href')).resolves.toEqual('https://www.renuo.ch/');
      await expect(readProp('.title', 'innerHTML', 0)).resolves.toEqual('I must review');
      await expect(readProp('.title', 'innerHTML', 1)).resolves.toEqual('No review requested');
      await expect(readProp('.title', 'innerHTML', 2)).resolves.toEqual('All reviews done');
      await expect(readProp('.title', 'innerHTML', 3)).resolves.toEqual('Missing Assignee');
      await expect(readProp('.title', 'innerHTML', 4)).resolves.toEqual('Assigned to me');
    });

    it('has the correct links', async () => {
      const link = (index: number): string => `https://github.com/renuo/github-pull-request-counter/pull/${index + 1}`;

      await expect(readProp('.pr-card .pr-link', 'href', 0)).resolves.toEqual(link(0));
      await expect(readProp('.pr-card .pr-link', 'href', 1)).resolves.toEqual(link(1));
      await expect(readProp('.pr-card .pr-link', 'href', 2)).resolves.toEqual(link(2));
    });

    it('has the correct subtitles', async () => {
      const repoName = 'renuo/github-pull-request-counter';
      
      await expect(readProp('.pr-card .repo-link', 'textContent', 0)).resolves.toEqual(repoName);
      await expect(readProp('.pr-card .repo-link', 'textContent', 1)).resolves.toEqual(repoName);
      await expect(readProp('.pr-card .repo-link', 'textContent', 2)).resolves.toEqual(repoName);
    });
  });
});
