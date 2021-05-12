import { extensionID } from '../../src/js/static/constants';
import puppeteer from 'puppeteer';
import path from 'path';

let browser: puppeteer.Browser;
let page: puppeteer.Page;

const url = (file: string) => `chrome-extension://${extensionID}/${file}`;

const popupLoaded = async () => {
  while (true) {
    await page.goto(url('popup.html'), {
      waitUntil: 'networkidle2'
    });

    if (await page.evaluate ( () => document.getElementById("pull-requests-loaded") !== undefined )) break;
  }
}

const setup = async () => {
  const extensionPath = path.join(__dirname, '../../dist');

  browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
    ]
  });

  page = await browser.newPage();

  await page.goto(url('options.html'), {
    waitUntil: 'networkidle2'
  });
  // TODO: Replace with a more sophisticated solution
  // The popup is loaded before the service worker is done.
  await page.type('input[id=access-token]', 'secret', { delay: 20 })
  await page.click('button[id="options-save"]');

  await popupLoaded();
};

const teardown = async () => {
  await browser.close();
};
// for options
// await expect(page.title()).resolves.toMatch('GitHub Pull Request Counter');

describe('popup.html', () => {
  beforeAll(setup);

  afterAll(teardown);

  it('1+1', async() => {
  });
});
