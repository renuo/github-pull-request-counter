import { PullRequestRecord } from '../../src/js/static/types';

export const issueFactory = (index: number) => ({
  id: index,
  title: `PullRequest-${index}-Title`,
  assignee: undefined,
  number: index,
  owner: 'renuo/github-pull-request-counter',
  pull_request: {
    url: `https://api.github.com/repos/renuo/github-pull-request-counter/pulls/${index+1}`,
    html_url: `https://github.com/renuo/github-pull-request-counter/pull/${index+1}`
  },
});

export const pullRequestRecordFactory = (count: number) => {
  const record: PullRequestRecord = {};
  for (let i = 0; i < count; i++) {
    record[`PullRequest-${i}`] = [issueFactory(i), issueFactory(i + count)];
  }
  return record;
};
