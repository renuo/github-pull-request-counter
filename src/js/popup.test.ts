/**
 * @jest-environment jsdom
 */

import { issueFactory } from '../../__test__/mocks/factories';
import { recordKeys } from './static/constants';

import Popup from './popup';

global.chrome = {
  storage: {
    local: {
      get: jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({
        [recordKeys[0]]: [ JSON.stringify([issueFactory(0), issueFactory(4)]) ],
        [recordKeys[1]]: [ JSON.stringify([issueFactory(1), issueFactory(5)]) ],
        [recordKeys[2]]: [ JSON.stringify([issueFactory(2), issueFactory(6)]) ],
        [recordKeys[3]]: [ JSON.stringify([issueFactory(3), issueFactory(7)]) ],
      })),
    }
  },
} as any;

describe('popup', () => {
  const dom = '<div id="popup"></div>';

  beforeAll(() => {
    document.body.innerHTML = dom;
  });

  it('renders pull-requests-loaded to the DOM', async () => {
    await Popup();
    expect(document.body.innerHTML).toContain('pull-requests-loaded');
  });
});
