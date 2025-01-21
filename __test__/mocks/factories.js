/**
 * @typedef {import('../../src/js/static/types').PullRequest} PullRequest
 * @typedef {import('../../src/js/static/types').PullRequestRecord} PullRequestRecord
 */

export const pullRequestFactory = (index) => ({
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
});

const createPullRequests = (count) => {
  const pullRequests = [];
  Array.from(Array(count)).forEach(() => pullRequests.push(pullRequestFactory(0)));
  return pullRequests;
};

/**
 * @typedef {Object} FactoryConfiguration
 * @property {number} [reviewRequestedCount]
 * @property {number} [teamReviewRequestedCount]
 * @property {number} [noReviewRequestedCount]
 * @property {number} [allReviewsDoneCount]
 * @property {number} [missingAssigneeCount]
 * @property {number} [allAssignedCount]
 */

/**
 * @param {FactoryConfiguration} [props]
 * @returns {PullRequestRecord}
 */
export const pullRequestRecordFactory = (props) => ({
  'reviewRequested': createPullRequests(props?.reviewRequestedCount || 0),
  'teamReviewRequested': createPullRequests(props?.teamReviewRequestedCount || 0),
  'noReviewRequested': createPullRequests(props?.noReviewRequestedCount || 0),
  'allReviewsDone': createPullRequests(props?.allReviewsDoneCount || 0),
  'missingAssignee': createPullRequests(props?.missingAssigneeCount || 0),
  'allAssigned': createPullRequests(props?.allAssignedCount || 0),
});
