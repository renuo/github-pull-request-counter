/**
 * @jest-environment jsdom
 */

import HTMLGenerator from './html-generator';
import { CounterConfig, PullRequestRecord } from '../static/types';
import { pullRequestRecordFactory } from '../../../__test__/mocks/factories';

describe('HTMLGenerator', () => {
  const htmlGenerator = HTMLGenerator();
  const defaultCounter = {
    reviewRequested: true,
    noReviewRequested: true,
    allReviewsDone: true,
    missingAssignee: true,
    allAssigned: false,
  };

  describe('#generate', () => {
    let record: PullRequestRecord;
    let counter: CounterConfig;
    let result: HTMLDivElement;

    beforeEach(() => {
      result = htmlGenerator.generate(record, counter);
    });

    describe('with an empty record', () => {
      beforeAll(() => {
        counter = defaultCounter;
        record = pullRequestRecordFactory();
      });

      it('outputs the backup element', () => {
        expect(result.outerHTML).toContain('Nothing to do');
        expect(result.outerHTML).toContain('Seems like you are a good coworker :)');
      });
    });

    describe('with a single record entry', () => {
      beforeAll(() => {
        record = pullRequestRecordFactory({ reviewRequestedCount: 1 });
      });

      it('has the correct <p> as its first child', () => {
        expect((result.childNodes[0] as HTMLParagraphElement).innerHTML).toEqual('I must review');
      });

      it('has the correct <div> as its second child', () => {
        expect((result.childNodes[1] as HTMLDivElement).className).toEqual('group-container');
      });

      describe('second child', () => {
        it('has one <div>', () => {
          expect(result.childNodes[1].childNodes.length).toEqual(1);
        });

        describe('<div>', () => {
          it('has the correct link', () => {
            const a = result.childNodes[1].childNodes[0].childNodes[0] as HTMLAnchorElement;

            expect(a.href).toEqual('https://github.com/renuo/github-pull-request-counter/pull/1');
            expect(a.target).toEqual('_blank');
            expect(a.innerHTML).toEqual('PullRequest-Title');
          });

          it('has the correct subdescription', () => {
            const p = result.childNodes[1].childNodes[0].childNodes[1] as HTMLAnchorElement;

            expect(p.innerHTML).toEqual(`renuo/github-pull-request-counter<b> #${record.reviewRequested[0].id}</b>`);
          });

          it('has the correct age', () => {
            const p = result.childNodes[1].childNodes[0].childNodes[2] as HTMLAnchorElement;

            expect(p.innerHTML).toEqual(`${Math.floor(record.reviewRequested[0].ageInDays)} days ago`);
          });
        });
      });

      describe('with the relevent category set to false', () => {
        beforeAll(() => {
          record = pullRequestRecordFactory({ reviewRequestedCount: 1 });
          counter = {
            reviewRequested: false,
            noReviewRequested: true,
            allReviewsDone: true,
            missingAssignee: true,
            allAssigned: true,
          };
        });

        it('the title has an additional class', () => {
          expect((result.childNodes[0] as HTMLParagraphElement).classList.value).toEqual('title less-relevant-group');
        });

        it('the group container has an additional class', () => {
          expect((result.childNodes[1] as HTMLDivElement).classList.value).toEqual('group-container less-relevant-group');
        });
      });
    });

    describe('with three record entries', () => {
      beforeAll(() => {
        record = pullRequestRecordFactory({ reviewRequestedCount: 1, noReviewRequestedCount: 2, allReviewsDoneCount: 3 });
      });

      it('has six childNodes', () => {
        expect(result.childNodes.length).toEqual(6);
      });
    });
  });
});
