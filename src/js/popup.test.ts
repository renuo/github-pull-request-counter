/**
 * @jest-environment jsdom
 */

import { pullRequestFactory } from '../../__test__/mocks/factories';
import { recordKeys } from './static/constants';
import Popup from './popup';
import fs from 'fs';
import path from 'path'

global.chrome = {
  storage: {
    local: {
      get: jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({
        [recordKeys[0]]: [ JSON.stringify([pullRequestFactory(0), pullRequestFactory(0)]) ],
        [recordKeys[1]]: [ JSON.stringify([pullRequestFactory(0), pullRequestFactory(0)]) ],
        [recordKeys[2]]: [ JSON.stringify([pullRequestFactory(0), pullRequestFactory(0)]) ],
        [recordKeys[3]]: [ JSON.stringify([pullRequestFactory(0), pullRequestFactory(0)]) ],
      })),
    },
  },
} as any;

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
