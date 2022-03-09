import BadgeSetter from './badge-setter';
import { PullRequestRecord } from '../static/types';
import { pullRequestRecordFactory } from '../../../__test__/mocks/factories';

global.chrome = {
  browserAction: {
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn(),
  },
} as any;

describe('BadgeSetter', () => {
  describe('update', () => {
    let record: PullRequestRecord;
    let counter = {
      'reviewRequested': true,
      'teamReviewRequested': true,
      'noReviewRequested': true,
      'allReviewsDone': true,
      'missingAssignee': true,
      'allAssigned': true,
    };

    beforeEach(() => {
      BadgeSetter().update(record, counter);
    });

    describe('with an empty record', () => {
      beforeAll(() => {
        record = pullRequestRecordFactory();
      });

      it('calls setBadgeText with the correct arguments', () => {
        expect(global.chrome.browserAction.setBadgeText).toHaveBeenCalledWith({ text: '0' });
      });

      it('calls setBadgeBackgroundColor with the correct arguments', () => {
        expect(global.chrome.browserAction.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: '#5cb85c' });
      });
    });

    describe('with one record entry', () => {
      beforeAll(() => {
        record = pullRequestRecordFactory({ reviewRequestedCount: 1 });
      });

      it('calls setBadgeText with the correct arguments', () => {
        expect(global.chrome.browserAction.setBadgeText).toHaveBeenCalledWith({ text: '1' });
      });

      it('calls setBadgeBackgroundColor with the correct arguments', () => {
        expect(global.chrome.browserAction.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: '#f0ad4e' });
      });
    });

    describe('with two record entries and five pull requests', () => {
      beforeAll(() => {
        record = pullRequestRecordFactory({ noReviewRequestedCount: 2, missingAssigneeCount: 3 });
      });

      it('calls setBadgeText with the correct arguments', () => {
        expect(global.chrome.browserAction.setBadgeText).toHaveBeenCalledWith({ text: '5' });
      });

      it('calls setBadgeBackgroundColor with the correct arguments', () => {
        expect(global.chrome.browserAction.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: '#d9534f' });
      });

      describe('with the missing assignee set to false', () => {
        beforeAll(() => {
          counter = {
            'reviewRequested': true,
            'teamReviewRequested': true,
            'noReviewRequested': true,
            'allReviewsDone': true,
            'missingAssignee': false,
            'allAssigned': true,
          };
        });

        it('calls setBadgeText with the correct arguments', () => {
          expect(global.chrome.browserAction.setBadgeText).toHaveBeenCalledWith({ text: '2' });
        });

        it('calls setBadgeBackgroundColor with the correct arguments', () => {
          expect(global.chrome.browserAction.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: '#d9534f' });
        });
      });
    });
  });
});
