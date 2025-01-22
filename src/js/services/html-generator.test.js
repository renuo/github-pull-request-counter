/** @jest-environment jsdom */

import HTMLGenerator from './html-generator.js';
import { pullRequestRecordFactory } from '../../../__test__/mocks/factories.js';

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

      it('has the correct title text', () => {
        const title = result.querySelector('.title');
        expect(title.tagName.toLowerCase()).toBe('h5');
        expect(title.textContent).toBe('I must review');
      });

      it('has the correct group container structure', () => {
        const container = result.querySelector('.group-container');
        expect(container).toBeTruthy();
        expect(container.children.length).toBe(1);
      });

      describe('group container', () => {
        it('has the correct link container', () => {
          const linkContainer = result.querySelector('.link-container');
          expect(linkContainer).toBeTruthy();
        });

        describe('<div>', () => {
          it('has the correct link', () => {
            const link = result.querySelector('.pr-link');
            expect(link.href).toEqual('https://github.com/renuo/github-pull-request-counter/pull/1');
            expect(link.target).toEqual('_blank');
            expect(link.textContent).toEqual('PullRequest-Title');
          });

          it('has the correct subdescription', () => {
            const subdesc = result.querySelector('.subdescription');
            const pr = record.reviewRequested[0];
            const timeText = pr.ageInDays < 1 ? 'today' : 
                           pr.ageInDays < 2 ? 'yesterday' : 
                           `${Math.floor(pr.ageInDays)} days ago`;
            
            expect(subdesc.textContent).toContain(pr.ownerAndName);
            expect(subdesc.textContent).toContain(`#${pr.number}`);
            expect(subdesc.textContent).toContain(`opened ${timeText}`);
            expect(subdesc.textContent).toContain(`by ${pr.author}`);
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

        it('adds less-relevant-group class to title and containers', () => {
          const title = result.querySelector('.title');
          const groupContainer = result.querySelector('.group-container');
          const linkContainer = result.querySelector('.link-container');
          
          expect(title.classList.contains('less-relevant-group')).toBe(true);
          expect(groupContainer.classList.contains('less-relevant-group')).toBe(true);
          expect(linkContainer.classList.contains('less-relevant-group')).toBe(true);
        });
      });
    });

    describe('with multiple record entries', () => {
      beforeAll(() => {
        record = pullRequestRecordFactory({ reviewRequestedCount: 1, noReviewRequestedCount: 2, allReviewsDoneCount: 3 });
      });

      beforeEach(() => {
        result = htmlGenerator.generate(record, counter);
      });

      it('creates correct number of sections', () => {
        const titles = result.querySelectorAll('.title');
        const groupContainers = result.querySelectorAll('.group-container');
        expect(titles.length).toBe(3); // One for each non-empty category
        expect(groupContainers.length).toBe(3);
      });

      describe('status badges', () => {
        it('includes correct number of badges', () => {
          const badges = result.querySelectorAll('.pr-status-badge');
          const totalPRs = record.reviewRequested.length + 
                          record.noReviewRequested.length + 
                          record.allReviewsDone.length;
          expect(badges.length).toBe(totalPRs);
        });

        it('has correct classes and text for each category', () => {
          // Review Requested badge
          const reviewBadge = result.querySelector('.status-review');
          expect(reviewBadge).toBeTruthy();
          expect(reviewBadge.textContent).toBe('Review Requested');

          // No Review badge
          const noReviewBadge = result.querySelector('.status-no-review');
          expect(noReviewBadge).toBeTruthy();
          expect(noReviewBadge.textContent).toBe('No Review');

          // Reviews Done badge
          const doneBadge = result.querySelector('.status-done');
          expect(doneBadge).toBeTruthy();
          expect(doneBadge.textContent).toBe('Reviews Done');
        });
      });

      describe('time formatting', () => {
        it('formats time correctly for different durations', () => {
          const formatTimeAgo = (days) => {
            const pr = pullRequestFactory(0);
            pr.ageInDays = days;
            const container = htmlGenerator.generate(
              pullRequestRecordFactory({ reviewRequestedCount: 1 }),
              defaultCounter
            );
            const subdesc = container.querySelector('.subdescription');
            return subdesc.textContent;
          };

          expect(formatTimeAgo(0.5)).toContain('today');
          expect(formatTimeAgo(1.5)).toContain('yesterday');
          expect(formatTimeAgo(5)).toContain('5 days ago');
          expect(formatTimeAgo(35)).toContain('1 month ago');
          expect(formatTimeAgo(65)).toContain('2 months ago');
        });
      });

      describe('assignee information', () => {
        it('shows assignee when present', () => {
          const pr = pullRequestFactory(0);
          pr.assignee = 'testuser';
          const container = htmlGenerator.generate(
            { reviewRequested: [pr] },
            defaultCounter
          );
          const assigneeSpan = container.querySelector('.pr-assignee');
          expect(assigneeSpan).toBeTruthy();
          expect(assigneeSpan.textContent).toContain('Assigned to testuser');
        });

        it('omits assignee section when not present', () => {
          const pr = pullRequestFactory(0);
          pr.assignee = undefined;
          const container = htmlGenerator.generate(
            { reviewRequested: [pr] },
            defaultCounter
          );
          const assigneeSpan = container.querySelector('.pr-assignee');
          expect(assigneeSpan).toBeNull();
        });
      });
    });
  });
});
