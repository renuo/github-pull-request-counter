/**
 * @jest-environment jsdom
 */

import Options from './options';
import { globalMock } from '../../__test__/mocks/github-api-mock-data';
import fetch from 'node-fetch';

jest.mock('node-fetch');
const mockedFetch = fetch as any;

global.fetch = mockedFetch;
global.btoa = (data: string) => Buffer.from(data).toString('base64');

mockedFetch.mockImplementation((url: string) => globalMock(url, { pullRequestCount: 2 }));

const counter = {
  reviewRequested: false,
  noReviewRequested: true,
  allReviewsDone: false,
  missingAssignee: true,
};

global.chrome = {
  storage: {
    local: {
      get: jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({
        'counter': JSON.stringify(counter),
        'accessToken': 'secret' ,
        'scope': 'renuo'
      })),
      set: jest.fn()
    }
  },
  action: {
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn(),
  }
} as any;

describe('Options', () => {
  const dom = `
    <input type="checkbox" id="review-requested"></input>
    <input type="checkbox" id="no-review-requested"></input>
    <input type="checkbox" id="all-reviews-done"></input>
    <input type="checkbox" id="missing-assignee"></input>
    <input type="text" id="account-names"></input>
    <input type="password" id="access-token"></input>
    <button id="options-save"></button>
  `;

  beforeAll(() => {
    document.body.innerHTML = dom;
  });

  describe('init', () => {
    beforeEach(() => {
      Options().init();
    });

    it('loads the checkboxes correctly', () => {
      expect((document.getElementById('no-review-requested') as HTMLInputElement).checked).toEqual(true);
      expect((document.getElementById('all-reviews-done') as HTMLInputElement).checked).toEqual(false);
      expect((document.getElementById('missing-assignee') as HTMLInputElement).checked).toEqual(true);
      expect((document.getElementById('review-requested') as HTMLInputElement).checked).toEqual(false);
    });

    it('loads the scope correctly', () => {
      expect((document.getElementById('account-names') as HTMLInputElement).value).toEqual('renuo');
    })

    it('loads the access token correctly', () => {
      expect((document.getElementById('access-token') as HTMLInputElement).value).toEqual('ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    })

    describe('without an access token', () => {
      beforeAll(() => {
        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({ 'accessToken': '' }));
        (document.getElementById('access-token') as HTMLInputElement).value = '';
      })

      afterAll(() => {
        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({
          'counter': JSON.stringify(counter),
          'accessToken': 'secret' ,
          'scope': 'renuo'
        }));
      })

      it ('doesn\'t load anything', () => {
        expect((document.getElementById('access-token') as HTMLInputElement).value).toEqual('');
      })
    })

    describe('save button', () => {
      const options = Options();
      beforeEach(() => {
        options.init();
      })

      it('stores the counter correctly', async () => {
        await options.saveButtonClickHandler();
        expect(global.chrome.storage.local.set).toHaveBeenCalledWith({ counter: JSON.stringify(counter) });
      })

      it('stores the scope correctly', async () => {
        await options.saveButtonClickHandler();
        expect(global.chrome.storage.local.set).toHaveBeenCalledWith({ scope: 'renuo' });
      })

      it('stores the access token correctly', async () => {
        (document.getElementById('access-token') as HTMLInputElement).value = 'new access token';
        await options.saveButtonClickHandler();
        expect(global.chrome.storage.local.set).toHaveBeenCalledWith({ accessToken: 'new access token'});
      })
    })
  });
})
