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
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
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

  describe('Health check button', () => {
    const dialogHandler = jest.fn(dialog => dialog.dismiss());

    beforeAll(() => {
      page.on('dialog', dialogHandler);
    });

    describe('when it is clicked', () => {
      beforeAll(async () => {
        await page.click('#health-check');
      });

      it('should have message "All good"', () => {
        const [firstCall] = dialogHandler.mock.calls;
        const [dialog] = firstCall;
        expect(dialog.message()).toEqual('All good');
      });
    });
  });
});
