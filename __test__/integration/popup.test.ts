import puppeteer from 'puppeteer-core';
import path from 'path';

describe('popup.html', () => {
  let browser: puppeteer.Browser;
  let page: puppeteer.Page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true
    });
    page = await browser.newPage();
    const URL = `file:///${path.resolve(__dirname, '../../dist/popup.html')}`;
    await page.goto(URL, {
      waitUntil: 'networkidle2'
    });
  });

  afterAll(async () => {
    await browser.close();
  });

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
