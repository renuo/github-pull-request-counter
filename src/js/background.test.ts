import ServiceWorker from './background';
import { globalMock } from '../../__test__/mocks/github-api-mock-data';
import fetch from 'node-fetch';

jest.mock('node-fetch');
const mockedFetch = fetch as any;

global.fetch = mockedFetch;
global.btoa = (data: string) => Buffer.from(data).toString('base64');

mockedFetch.mockImplementation((url: string) => globalMock(url, { pullRequestCount: 2 }));

global.chrome = {
  alarms: {
    create: jest.fn(),
    onAlarm: {
      addListener: jest.fn()
    }
  },
  storage: {
    local: {
      get: jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({
        'counter': 'invalid' ,
        'accessToken': 'secret'
      })),
      set: jest.fn()
    }
  },
  action: {
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn(),
  }
} as any;

describe('ServiceWorker', () => {
  const serviceWorker = ServiceWorker();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('#fetchAndStoreData', () => {
    beforeEach(async () => {
      await serviceWorker.fetchAndStoreData();
    });

    it('calls set four times', () => {
      expect(global.chrome.storage.local.set).toBeCalledTimes(4);
    });

    it('calls setBadgeText with the correct arguments', () => {
      expect(global.chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '8' });
    });

    it('calls setBadgeBackgroundColor with the correct arguments', () => {
      expect(global.chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: '#d9534f' });
    });

    describe('without an access token', () => {
      beforeAll(() => {
        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({
          'counter': 'invalid' ,
          'accessToken': ''
        }));
      });

      afterAll(() => {
        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({
          'counter': 'invalid' ,
          'accessToken': 'secret'
        }));
      });

      it('calls setBadgeText with the correct arguments', () => {
        expect(global.chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '0' });
      });

      it('calls setBadgeBackgroundColor with the correct arguments', () => {
        expect(global.chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: '#5cb85c' });
      });
    });

    describe('with too many requests', () => {
      afterAll(() => {
        mockedFetch.mockImplementation((url: string) => globalMock(url, { pullRequestCount: 2 }));
      });

      describe('while fetching the user', () => {
        beforeAll(() => {
          mockedFetch.mockImplementation(() => Promise.resolve({ status: 403 }));
        });

        it('doesn\'t call set', () => {
          expect(global.chrome.storage.local.set).not.toHaveBeenCalled();
        });
      });

      describe('while fetching data', () => {
        beforeAll(() => {
          mockedFetch.mockImplementation((url: string) => {
            if (url.includes('/user')) {
              return Promise.resolve({ json: () => ({ login: 'renuo' }) });
            } else {
              return Promise.resolve({ status: 403 });
            }
          });
        });

        it('doesn\'t call set', () => {
          expect(global.chrome.storage.local.set).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('with other errors', () => {
    afterAll(() => {
      mockedFetch.mockImplementation((url: string) => globalMock(url, { pullRequestCount: 2 }));
    });

    describe('while fetching the user', () => {
      beforeAll(() => {
        mockedFetch.mockImplementation(() => Promise.resolve({}));
      });

      it('doesn\'t call set', () => {
        expect(serviceWorker.fetchAndStoreData()).rejects.toThrowError('response.json is not a function');
      });
    });

    describe('while fetching data', () => {
      beforeAll(() => {
        mockedFetch.mockImplementation((url: string) => {
          if (url.includes('/user')) {
            return Promise.resolve({ json: () => ({ login: 'renuo' }) });
          } else {
            return Promise.resolve({});
          }
        });
      });

      it('doesn\'t call set', () => {
        expect(serviceWorker.fetchAndStoreData()).rejects.toThrowError('response.json is not a function');
      });
    });
  });

  describe('#startPolling', () => {
    beforeEach(async () => {
      await serviceWorker.startPolling();
    });

    it('calls set four times', () => {
      expect(global.chrome.storage.local.set).toBeCalledTimes(4);
    });

    it('calls addListener', () => {
      expect(global.chrome.alarms.onAlarm.addListener).toBeCalledTimes(1);
    });
  });
});

