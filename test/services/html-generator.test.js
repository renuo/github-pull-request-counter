/** @jest-environment jsdom */

import HTMLGenerator from '../../src/js/services/html-generator.js';
import { pullRequestRecordFactory } from '../mocks/factories.js';

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

    beforeAll(() => {
      counter = defaultCounter;
    });

    describe('with an empty record', () => {
      beforeAll(() => {
        record = pullRequestRecordFactory();
      });

      beforeEach(() => {
        result = htmlGenerator.generate(record, counter);
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

      beforeEach(() => {
        result = htmlGenerator.generate(record, counter);
      });

      it('has the correct <p> as its first child', () => {
        expect(result.childNodes[0].innerHTML).toEqual('I must review');
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

          it('displays PR info without PR number', () => {
            const subdescription = result.querySelector('.subdescription');
            expect(subdescription.textContent).not.toContain('#');
            expect(subdescription.textContent).toMatch(/opened .* ago by/);
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
      });
    });

    describe('with three record entries', () => {
      beforeAll(() => {
        record = pullRequestRecordFactory({ reviewRequestedCount: 1, noReviewRequestedCount: 2, allReviewsDoneCount: 3 });
      });

      beforeEach(() => {
        result = htmlGenerator.generate(record, counter);
      });

      it('has six childNodes', () => {
        expect(result.childNodes.length).toEqual(6);
      });
    });
  });
});
