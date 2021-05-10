import BadgeSetter from './badge-setter';
import { PullRequestRecord } from '../static/types';
import { pullRequestRecordFactory } from '../../../__test__/mocks/factories';

global.chrome = {
  action: {
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn(),
  }
} as any;

describe('BadgeSetter', () => {
  describe('update', () => {
    let record: PullRequestRecord;

    beforeEach(() => {
      BadgeSetter().update(record, {});
    });

    describe('with an empty record', () => {
      beforeAll(() => {
        record = pullRequestRecordFactory(0);
      });
      it('calls setBadgeText with the correct arguments', () => {
        expect(global.chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '0' });
      });

      it('calls setBadgeBackgroundColor with the correct arguments', () => {
        expect(global.chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: '#5cb85c' });
      });
    });

    describe('with one record entry', () => {
      beforeAll(() => {
        record = pullRequestRecordFactory(1);
      });
      it('calls setBadgeText with the correct arguments', () => {
        expect(global.chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '2' });
      });

      it('calls setBadgeBackgroundColor with the correct arguments', () => {
        expect(global.chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: '#f0ad4e' });
      });
    });

    describe('with five record entries', () => {
      beforeAll(() => {
        record = pullRequestRecordFactory(5);
      });
      it('calls setBadgeText with the correct arguments', () => {
        expect(global.chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '10' });
      });

      it('calls setBadgeBackgroundColor with the correct arguments', () => {
        expect(global.chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: '#d9534f' });
      });
    });
  });
});
