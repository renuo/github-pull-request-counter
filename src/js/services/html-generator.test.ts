/**
 * @jest-environment jsdom
 */

import HTMLGenerator from './html-generator';
import { PullRequestRecord } from '../types/types';
import { pullRequestRecordFactory } from '../../../__test__/mocks/factories';

describe('HTMLGenerator', () => {
  const htmlGenerator = HTMLGenerator();

  describe('#generate', () => {
    let record: PullRequestRecord = {};
    let result: HTMLDivElement;

    beforeEach(() => {
      result = htmlGenerator.generate(record);
    });

    describe('with an empty record', () => {
      it('outputs the backup element', () => {
        // TODO
        // expect('todo').toEqual('implement');
      });
    });

    describe('with a single record entry', () => {
      beforeAll(() => {
        record = pullRequestRecordFactory(1);
      });

      it('has the correct <p> as its first child', () => {
        expect((result.childNodes[0] as HTMLParagraphElement).innerHTML).toEqual('PullRequest-0');
      });

      it('has the correct <div> as its second child', () => {
        expect((result.childNodes[1] as HTMLDivElement).className).toEqual('group-container');
      });

      describe('second child', () => {
        it('has two <div>\'s', () => {
          expect(result.childNodes[1].childNodes.length).toEqual(2);
        });

        describe('first div', () => {
          it('has the correct <a>', () => {
            const a = result.childNodes[1].childNodes[0].childNodes[0] as HTMLAnchorElement;

            expect(a.href).toEqual('https://github.com/renuo/github-pull-request-counter/pull/1');
            expect(a.target).toEqual('_blank');
            expect(a.innerHTML).toEqual('PullRequest-0-Title');
          });
        });
      });
    });

    describe('with three record entries', () => {
      beforeAll(() => {
        record = pullRequestRecordFactory(3);
      });

      it('has six childNodes', () => {
        expect(result.childNodes.length).toEqual(6);
      });
    });
  });
});
