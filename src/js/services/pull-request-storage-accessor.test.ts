import PullRequestStorageAccessor from './pull-request-storage-accessor';
import { PullRequestRecord } from '../static/types';
import { pullRequestFactory, pullRequestRecordFactory } from '../../../__test__/mocks/factories';

global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
} as any;

describe('StorageSerialzer', () => {
  const storage = PullRequestStorageAccessor();
  const setMock = global.chrome.storage.local.set;
  let pullRequests: PullRequestRecord;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('#storePullRequests', () => {

    beforeEach(() => {
      storage.storePullRequests(pullRequests);
    });

    describe('with an empty record', () => {
      beforeAll(() => {
        pullRequests = pullRequestRecordFactory();
      });

      it('doesn\'t store anything', () => {
        expect(setMock).toBeCalledTimes(6);
      });
    });

    describe('with one record entry', () => {
      beforeAll(() => {
        pullRequests = pullRequestRecordFactory({ reviewRequestedCount: 1 });
      });

      it('calls set with the right arguments', () => {
        expect(setMock).toHaveBeenNthCalledWith(1, { 'reviewRequested': JSON.stringify([pullRequestFactory(0)]) });
      });
    });

    describe('with four record entries', () => {
      beforeAll(() => {
        pullRequests = pullRequestRecordFactory({
          reviewRequestedCount: 1,
          teamReviewRequestedCount: 1,
          noReviewRequestedCount: 1,
          allReviewsDoneCount: 1,
          missingAssigneeCount: 1,
          allAssignedCount: 1,
        });
      });

      it('calls set five times', () => {
        expect(setMock).toBeCalledTimes(6);
      });
    });
  });

  describe('#loadPullRequests', () => {
    let result: PullRequestRecord;
    const getMock = global.chrome.storage.local.get;

    beforeEach(async () => {
      result = await storage.loadPullRequests();
    });

    describe('default value', () => {
      beforeAll(() => {
        pullRequests = pullRequestRecordFactory({ reviewRequestedCount: 1 });

        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys: string, callback: (items: any) => void): void => {
          callback({});
        });
      });

      it('loads empty arrays', () => {
        expect(result).toEqual({
          reviewRequested: [],
          teamReviewRequested: [],
          noReviewRequested: [],
          allReviewsDone: [],
          missingAssignee: [],
          allAssigned: [],
        });
      });
    });

    describe('with no keys', () => {
      beforeAll(() => {
        pullRequests = pullRequestRecordFactory();
      });

      it('doesn\'t load anything', () => {
        expect(getMock).toBeCalledTimes(0);
      });
    });

    describe('with one stored record', () => {
      beforeAll(() => {
        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys: string, callback: (items: any) => void): void => {
          callback({ 'reviewRequested': [JSON.stringify([pullRequestFactory(0)])] });
        });

        pullRequests = pullRequestRecordFactory({ reviewRequestedCount: 1 });
      });

      it('loads the correct data', () => {
        expect(global.chrome.storage.local.get).toBeCalledTimes(6);
        expect(result).toEqual(pullRequests);
      });
    });

    describe('with four stored records', () => {
      beforeAll(() => {
        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys: string, callback: (items: any) => void): void => {
          callback({
            'reviewRequested': [JSON.stringify([pullRequestFactory(0)])],
            'teamReviewRequested': [JSON.stringify([pullRequestFactory(0)])],
            'noReviewRequested': [JSON.stringify([pullRequestFactory(0)])],
            'allReviewsDone': [JSON.stringify([pullRequestFactory(0)])],
            'missingAssignee': [JSON.stringify([pullRequestFactory(0)])],
            'allAssigned': [JSON.stringify([pullRequestFactory(0)])],
          });
        });

        pullRequests = pullRequestRecordFactory({
          reviewRequestedCount: 1,
          teamReviewRequestedCount: 1,
          noReviewRequestedCount: 1,
          allReviewsDoneCount: 1,
          missingAssigneeCount: 1,
          allAssignedCount: 1,
        });
      });

      it('loads the correct data', () => {
        expect(global.chrome.storage.local.get).toBeCalledTimes(6);
        expect(result).toEqual(pullRequests);
      });
    });
  });
});
