import { extensionID, displayedAccessToken } from '../../src/js/services/constants.js';
import puppeteer from 'puppeteer';
import path from 'path';

let browser;
let page;

const url = (file) => `chrome-extension://${extensionID}/${file}`;

// readProp('.password', 'value', 1)
// will run
// document.querySelectorAll('.password')[1].value
// and return the value of the second node matching the selector '.password'.
const readProp = (query, prop, index = 0) => (
    page.evaluate((query, prop, index) => (
        document.querySelectorAll(query)[index][prop]
    ), query, prop, index)
);

const setup = async () => {
    const extensionPath = path.join(__dirname, '../../src');

    const isHeadless = process.env.PUPPETEER_HEADLESS?.toLowerCase() !== 'false';
    const isCI = process.env.CI === 'true';

    const args = [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
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
});