import { PullRequestRecordKey } from '../../src/js/static/types.js';

// Creates a mock pull request object
export const pullRequestFactory = (index) => {
  return {
    id: index,
    title: 'PullRequest-Title',
    assignee: undefined,
    number: index,
    createdAt: Date.parse('2021-07-06T14:17:00Z'),
    ageInDays: 100.5,
    ownerAndName: 'renuo/github-pull-request-counter',
    url: `https://api.github.com/repos/renuo/github-pull-request-counter/pulls/${index + 1}`,
    repositoryUrl: 'https://api.github.com/repos/renuo/github-pull-request-counter',
    htmlUrl: `https://github.com/renuo/github-pull-request-counter/pull/${index + 1}`,
    author: 'coorasse',
  };

  // Creates an array of mock pull requests
  const createPullRequests = (count) => {
  const pullRequests = [];
  Array.from(Array(count)).forEach(() => pullRequests.push(pullRequestFactory(0)));
  return pullRequests;
};

// Configuration object for factory
// reviewRequestedCount: number of review requested PRs
// teamReviewRequestedCount: number of team review requested PRs
// noReviewRequestedCount: number of PRs with no review requested
// allReviewsDoneCount: number of PRs with all reviews done
// missingAssigneeCount: number of PRs missing assignee
// allAssignedCount: number of assigned PRs
// Factory for creating pull request records with configurable counts
  export const pullRequestRecordFactory = (props) => ({
  'reviewRequested': createPullRequests(props?.reviewRequestedCount || 0),
  'teamReviewRequested': createPullRequests(props?.teamReviewRequestedCount || 0),
  'noReviewRequested': createPullRequests(props?.noReviewRequestedCount || 0),
  'allReviewsDone': createPullRequests(props?.allReviewsDoneCount || 0),
  'missingAssignee': createPullRequests(props?.missingAssigneeCount || 0),
  'allAssigned': createPullRequests(props?.allAssignedCount || 0),
});
