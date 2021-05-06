import puppeteer from 'puppeteer';
import path from 'path';

let browser: puppeteer.Browser;
let page: puppeteer.Page;

const setup = async () => {
  const extensionPath = path.join(__dirname, '../../dist');
  const extensionID = 'kiddjljoajjpciconkdenlbgecmbmafm';
  const extensionPopupHtml = 'popup.html';
  const URL = `chrome-extension://${extensionID}/${extensionPopupHtml}`;

  browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`
    ]
  });

  page = await browser.newPage();

  await page.goto(URL, {
    waitUntil: 'networkidle2'
  });
};

const teardown = async () => {
  await browser.close();
};

describe('popup.html', () => {
  beforeAll(setup);

  afterAll(teardown);

  it('1+1', () => {
    expect(1+1).toEqual(2);
  });
});
