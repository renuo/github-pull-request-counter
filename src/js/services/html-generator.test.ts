/**
 * @jest-environment jsdom
 */

import HTMLGenerator from './html-generator';
import { PullRequestRecord } from '../types/types';
import { pullRequestRecordFactory } from '../../../__test__/mocks/factories';

describe('HTMLGenerator', () => {
  const htmlGenerator = HTMLGenerator();

  describe('#generate', () => {
    let record: PullRequestRecord;
    let result: HTMLDivElement;

    beforeEach(() => {
      result = htmlGenerator.generate(record);
    })

    beforeAll(() => {
      record = pullRequestRecordFactory(1);
    })

    it('a', () => {
      expect(result).toEqual(1);
    })
  })
})
