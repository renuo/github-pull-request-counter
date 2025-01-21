import { extensionID, displayedAccessToken } from '../../src/js/static/constants';
import puppeteer from 'puppeteer';
import path from 'path';

let browser: puppeteer.Browser;
let page: puppeteer.Page;

const url = (file: string) => `chrome-extension://${extensionID}/${file}`;

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

  browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
    ],
  });

  page = await browser.newPage();

  page.on('dialog', async dialog => dialog.dismiss());
};

const teardown = async () => {
  await browser.close();
};

describe('integration test', () => {
  beforeAll(setup);
  afterAll(teardown);

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
      await page.click('#review-requested');
      await page.click('#all-reviews-done');
      await page.click('#all-assigned');
      await page.click('button[id="options-save"]');

      await page.goto(url('options.html'), { waitUntil: 'networkidle2' });

      expect(await readProp('#review-requested', 'checked')).toEqual(false);
      expect(await readProp('#team-review-requested', 'checked')).toEqual(true);
      expect(await readProp('#no-review-requested', 'checked')).toEqual(true);
      expect(await readProp('#all-reviews-done', 'checked')).toEqual(false);
      expect(await readProp('#missing-assignee', 'checked')).toEqual(true);
      expect(await readProp('#all-assigned', 'checked')).toEqual(true); // Because it is false by default
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
      await page.goto(url('popup.html'), { waitUntil: 'networkidle2' });
    });

    it('navigates to the popup', async () => {
      expect(page.url()).toEqual(url('popup.html'));
    });

    it('has the correct content', async () => {
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
