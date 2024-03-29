/**
 * @jest-environment jsdom
 */

import Options from './options';
import { globalMock } from '../../__test__/mocks/github-api-mock-data';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { displayedAccessToken } from './static/constants';

jest.mock('node-fetch');
const mockedFetch = fetch as any;

global.fetch = mockedFetch;
global.btoa = (data: string) => Buffer.from(data).toString('base64');

mockedFetch.mockImplementation((url: string) => globalMock(url, { pullRequestCount: 2 }));

global.window.alert = jest.fn();

const counter = {
  reviewRequested: false,
  teamReviewRequested: false,
  noReviewRequested: true,
  allReviewsDone: false,
  missingAssignee: true,
  allAssigned: false,
};

global.chrome = {
  storage: {
    local: {
      get: jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({
        'counter': JSON.stringify(counter),
        'maximumAge': '555',
        'accessToken': 'secret',
        'scope': 'renuo',
        'ignored': 'renuo/test#1',
      })),
      set: jest.fn(),
    },
  },
  action: {
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn(),
  },
} as any;

describe('Options', () => {
  const dom = fs.readFileSync(path.resolve(__dirname, '../options.html')).toString();

  beforeAll(() => {
    document.body.innerHTML = dom;
  });

  describe('init', () => {
    beforeEach(() => {
      Options().init();
    });

    it('loads the checkboxes correctly', () => {
      expect((document.getElementById('review-requested') as HTMLInputElement).checked).toEqual(false);
      expect((document.getElementById('no-review-requested') as HTMLInputElement).checked).toEqual(true);
      expect((document.getElementById('all-reviews-done') as HTMLInputElement).checked).toEqual(false);
      expect((document.getElementById('missing-assignee') as HTMLInputElement).checked).toEqual(true);
      expect((document.getElementById('all-assigned') as HTMLInputElement).checked).toEqual(false);
    });

    it('loads the maximum age correctly', () => {
      expect((document.getElementById('maximum-age') as HTMLInputElement).value).toEqual('555');
    });

    it('loads the scope correctly', () => {
      expect((document.getElementById('account-names') as HTMLInputElement).value).toEqual('renuo');
    });

    it('loads the ignored PRs correctly', () => {
      expect((document.getElementById('ignored-prs') as HTMLInputElement).value).toEqual('renuo/test#1');
    });

    it('loads the access token correctly', () => {
      expect((document.getElementById('access-token') as HTMLInputElement).value).toEqual(displayedAccessToken);
    });

    describe('without an access token', () => {
      beforeAll(() => {
        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({
          'accessToken': '',
        }));
        (document.getElementById('access-token') as HTMLInputElement).value = '';
      });

      afterAll(() => {
        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({
          'counter': JSON.stringify(counter),
          'maximumAge': '555',
          'accessToken': 'secret',
          'scope': 'renuo',
          'ignored': 'renuo/test#1',
        }));
      });

      it('doesn\'t load anything', () => {
        expect((document.getElementById('access-token') as HTMLInputElement).value).toEqual('');
      });
    });
  });

  describe('save button', () => {
    const options = Options();
    beforeEach(() => {
      options.init();
    });

    it('stores the counter correctly', async () => {
      await options.saveButtonClickHandler();
      expect(global.chrome.storage.local.set).toHaveBeenCalledWith({ counter: JSON.stringify(counter) });
    });

    it('stores the maximum age correctly', async () => {
      await options.saveButtonClickHandler();
      expect(global.chrome.storage.local.set).toHaveBeenCalledWith({ maximumAge: '555' });
    });

    it('stores the scope correctly', async () => {
      await options.saveButtonClickHandler();
      expect(global.chrome.storage.local.set).toHaveBeenCalledWith({ scope: 'renuo' });
    });

    it('stores the ignored PRs correctly', async () => {
      await options.saveButtonClickHandler();
      expect(global.chrome.storage.local.set).toHaveBeenCalledWith({ ignored: 'renuo/test#1' });
    });

    it('stores the access token correctly', async () => {
      (document.getElementById('access-token') as HTMLInputElement).value = 'new access token';
      await options.saveButtonClickHandler();
      expect(global.chrome.storage.local.set).toHaveBeenCalledWith({ accessToken: 'new access token' });
    });

    it('opens an alert window', async () => {
      await options.saveButtonClickHandler();
      expect(global.window.alert).toHaveBeenCalledWith('Your settings have been saved and your pull requests will be updated shortly!');
    });
  });
});
