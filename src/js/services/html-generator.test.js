/**
 * @jest-environment jsdom
 */

import HTMLGenerator from './html-generator';
import { pullRequestRecordFactory } from '../../../__test__/mocks/factories';

describe('HTMLGenerator', () => {
  const htmlGenerator = HTMLGenerator();
  const defaultCounter = {
    reviewRequested: true,
    teamReviewRequested: true,
    noReviewRequested: true,
    allReviewsDone: true,
    missingAssignee: true,
    allAssigned: false,
  };

  describe('#generate', () => {
    let record;
    let counter;
    let result;

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
        expect(result.innerHTML).toContain('I must review');
      });

      it('has the correct <div> as its second child', () => {
        expect(result.childNodes[1].className).toEqual('group-container');
      });

      describe('second child', () => {
        it('has one <div>', () => {
          expect(result.childNodes[1].childNodes.length).toEqual(1);
        });

        describe('<div>', () => {
          it('has the correct link', () => {
            const a = result.querySelector('.pr-link');

            expect(a.href).toEqual('https://github.com/renuo/github-pull-request-counter/pull/1');
            expect(a.target).toEqual('_blank');
            expect(a.innerHTML).toEqual('PullRequest-Title');
          });

          it('has the correct subdescription', () => {
            const p = result.querySelector('.repo-link');
            expect(p.innerHTML).toContain('renuo/github-pull-request-counter');
          });
        });
      });

      describe('with the relevent category set to false', () => {
        beforeAll(() => {
          record = pullRequestRecordFactory({ reviewRequestedCount: 1 });
          counter = {
            reviewRequested: false,
            teamReviewRequested: false,
            noReviewRequested: true,
            allReviewsDone: true,
            missingAssignee: true,
            allAssigned: true,
          };
        });

        it('the title has an additional class', () => {
          expect(result.childNodes[0].classList.value).toEqual('title less-relevant-group');
        });

        it('the group container has an additional class', () => {
          expect(result.childNodes[1].classList.value).toEqual('group-container less-relevant-group');
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
