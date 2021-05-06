import ServiceWoker from './background';
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
      get: jest.fn(),
      set: jest.fn()
    }
  }
} as any;

describe('ServiceWorker', () => {
  const serviceWorker = ServiceWoker();

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

