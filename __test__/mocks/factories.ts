import { PullRequest, PullRequestRecord } from '../../src/js/static/types';

export const pullRequestFactory = (index: number): PullRequest => ({
  id: index,
  title: 'PullRequest-Title',
  assignee: undefined,
  number: index,
  ownerAndName: 'renuo/github-pull-request-counter',
  url: `https://api.github.com/repos/renuo/github-pull-request-counter/pulls/${index+1}`,
  html_url: `https://github.com/renuo/github-pull-request-counter/pull/${index+1}`,
});

const createPullRequests = (count: number): PullRequest[] => {
  const pullRequests: PullRequest[] = [];
  Array.from(Array(count)).forEach(() => pullRequests.push(pullRequestFactory(0)));
  return pullRequests;
};

type FactoryConfiguration = {
  reviewRequestedCount?: number,
  noReviewRequestedCount?: number,
  allReviewsDoneCount?: number,
  missingAssigneeCount?: number,
};
export const pullRequestRecordFactory = (props?: FactoryConfiguration): PullRequestRecord => ({
  'reviewRequested': createPullRequests(props?.reviewRequestedCount || 0),
  'noReviewRequested': createPullRequests(props?.noReviewRequestedCount || 0),
  'allReviewsDone': createPullRequests(props?.allReviewsDoneCount || 0),
  'missingAssignee': createPullRequests(props?.missingAssigneeCount || 0),
});
