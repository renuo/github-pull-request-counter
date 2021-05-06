import StorageSerializer from './storage-serializer';
import { PullRequestRecord } from '../types/types';
import { issueFactory, pullRequestRecordFactory } from '../../../__test__/mocks/factories';

global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  }
} as any;

describe('StorageSerialzer', () => {
  const storageSerilizer = StorageSerializer();
  const setMock = global.chrome.storage.local.set;
  let pullRequests: PullRequestRecord;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('#storePullRequests', () => {

    beforeEach(() => {
      storageSerilizer.storePullRequests(pullRequests);
    });

    describe('with an empty record', () => {
      beforeAll(() => {
        pullRequests = {};
      });

      it('doesn\'t store anything', () => {
        expect(setMock).toBeCalledTimes(0);
      });
    });

    describe('with one record entry', () => {
      beforeAll(() => {
        pullRequests = pullRequestRecordFactory(1);
      });

      it('calls set with the right arguments', () => {
        expect(setMock).toHaveBeenNthCalledWith(1, { 'PullRequest-0': JSON.stringify([issueFactory(0), issueFactory(1)]) });
      });
    });

    describe('with five record entries', () => {
      beforeAll(() => {
        pullRequests = pullRequestRecordFactory(5);
      });

      it('calls set five times', () => {
        expect(setMock).toBeCalledTimes(5);
      });
    });
  });

  describe('#loadPullRequests', () => {
    let keys: string[];
    let result: PullRequestRecord;
    const getMock = global.chrome.storage.local.get;

    beforeEach(async () => {
      keys = Object.keys(pullRequests);
      result = await storageSerilizer.loadPullRequests(keys);
    });

    describe('with no keys', () => {
      beforeAll(() => {
        pullRequests = {};
      });

      it('doesn\'t load anything', () => {
        expect(getMock).toBeCalledTimes(0);
      });
    });

    describe('with one stored record', () => {
      beforeAll(() => {
        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys: string, callback: (items: any) => void): void => {
          callback({ 'PullRequest-0': [ JSON.stringify([issueFactory(0), issueFactory(1)]) ] });
        });

        pullRequests = pullRequestRecordFactory(1);
      });

      it('loads the correct data', () => {
        expect(global.chrome.storage.local.get).toBeCalledTimes(1);
        expect(result).toEqual(pullRequests);
      });
    });

    describe('with four stored records', () => {
      beforeAll(() => {
        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys: string, callback: (items: any) => void): void => {
          callback({
            'PullRequest-0': [ JSON.stringify([issueFactory(0), issueFactory(4)]) ],
            'PullRequest-1': [ JSON.stringify([issueFactory(1), issueFactory(5)]) ],
            'PullRequest-2': [ JSON.stringify([issueFactory(2), issueFactory(6)]) ],
            'PullRequest-3': [ JSON.stringify([issueFactory(3), issueFactory(7)]) ]
          });
        });

        pullRequests = pullRequestRecordFactory(4);
      });

      it('loads the correct data', () => {
        expect(global.chrome.storage.local.get).toBeCalledTimes(4);
        expect(result).toEqual(pullRequests);
      });
    });
  });
});
