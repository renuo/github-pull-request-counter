/**
 * @jest-environment jsdom
 */

import { pullRequestFactory } from '../__test__/mocks/factories.js';
import Popup from '../src/js/popup.js';
import fs from 'fs';
import path from 'path';
import { PullRequestRecordKey } from '../src/js/static/constants.js';

const pullRequestSample = [pullRequestFactory(0), pullRequestFactory(0)];
const storageObject = Object.values(PullRequestRecordKey).reduce((obj, key) => {
  return { ...obj, [key]: [JSON.stringify(pullRequestSample)] };
}, {});

global.chrome = {
  storage: {
    local: {
      get: jest.fn().mockImplementation((_keys, callback) => callback(storageObject)),
    },
  },
};

describe('popup', () => {
  const dom = fs.readFileSync(path.resolve(__dirname, '../popup.html')).toString();

  beforeAll(() => {
    document.body.innerHTML = dom;
  });

  it('renders pull-requests-loaded to the DOM', async () => {
    await Popup();
    expect(document.body.innerHTML).toContain('pull-requests-loaded');
  });
});
