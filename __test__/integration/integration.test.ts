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
const readProp = async (query: string, prop: string, index = 0) => (
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
    it('navigates to the options page', async () => {
      await page.goto(url('options.html'), { waitUntil: 'networkidle2' });
      page.evaluate(() => {
        document.querySelectorAll('.hover-label').forEach((e) => e.classList.remove('hover-label'));
      });

      expect(page.title()).resolves.toMatch('GitHub Pull Request Counter');
      expect(page.url()).toEqual(url('options.html'));
    });

    it('has the correct content', () => {
      expect(readProp('.title', 'innerHTML')).resolves.toEqual('Options');
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
      while (await page.evaluate(() => document.querySelector('.pull-requests-loaded') === null)) {
        await page.goto(url('popup.html'), { waitUntil: 'networkidle2' });
      }

      expect(page.url()).toEqual(url('popup.html'));
    });

    it('has the correct content', () => {
      expect(readProp('#link-to-renuo', 'href')).resolves.toEqual('https://www.renuo.ch/');
      expect(readProp('.title', 'innerHTML', 0)).resolves.toEqual('I must review');
      expect(readProp('.title', 'innerHTML', 1)).resolves.toEqual('No review requested');
      expect(readProp('.title', 'innerHTML', 2)).resolves.toEqual('All reviews done');
      expect(readProp('.title', 'innerHTML', 3)).resolves.toEqual('Missing Assignee');
      expect(readProp('.title', 'innerHTML', 4)).resolves.toEqual('Assigned to me');
    });

    it('has the correct links', () => {
      const link = (index: number) => `https://github.com/renuo/github-pull-request-counter/pull/${index + 1}`;

      expect(readProp('.link-container > a', 'href', 0)).resolves.toEqual(link(0));
      expect(readProp('.link-container > a', 'href', 1)).resolves.toEqual(link(1));
      expect(readProp('.link-container > a', 'href', 2)).resolves.toEqual(link(2));
    });

    it('has the correct subtitles', () => {
      const subtitle = (index: number) => `renuo/github-pull-request-counter<b> #${index + 1}</b>`;

      expect(readProp('.link-container > .subdescription', 'innerHTML', 0)).resolves.toContain(subtitle(0));
      expect(readProp('.link-container > .subdescription', 'innerHTML', 1)).resolves.toContain(subtitle(1));
      expect(readProp('.link-container > .subdescription', 'innerHTML', 2)).resolves.toContain(subtitle(2));
    });
  });
});
