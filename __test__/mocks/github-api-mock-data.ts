import { Issue } from '../../src/js/static/types';

export const mockListOfPullRequests = (count: number, params?: { assignee: string | undefined, created_at: number | undefined}) => {
  const createIssues = (count: number): Issue[] => {
    const items = [];

    for (let i = 0; i < count; i++) {
      const prNumber = i + 1; // PR numbers start from 1 and increment
      items.push({
        id: Math.floor(Math.random() * 100),
        title: 'PR Title',
        assignee: params?.assignee,
        number: prNumber,
        created_at: params?.created_at || Date.now(),
        repository_url: 'https://api.github.com/repos/renuo/github-pull-request-counter',
        pull_request: {
          url: `https://api.github.com/repos/renuo/github-pull-request-counter/pulls/${prNumber}`,
          html_url: `https://github.com/renuo/github-pull-request-counter/pull/${prNumber}`,
        },
        user: {
          login: 'coorasse',
        },
      });
    }

    return items;
  };

  return {
    total_count: count,
    items: createIssues(count),
  };
};

export const mockRequestedReviewers = (usersCount: number, teamsCount: number) => {
  const createRandomID = (): number => Math.floor(Math.random() * 100);

  const createReviewers = (count: number) => {
    const reviewer = [];
    for (let i = 0; i < count; i++) {
      reviewer.push({ id: createRandomID() });
    }
    return reviewer;
  };

  return {
    users: createReviewers(usersCount),
    teams: createReviewers(teamsCount),
  };
};

interface GlobalMockParams {
  pullRequestCount?: number;
  openUserRequestCount?: number;
  openTeamRequestCount?: number;
}

export const globalMock = (url: string, params?: GlobalMockParams) => {
  if (url.includes('/requested_reviewers')) {
    return Promise.resolve({
      json: () => Promise.resolve(mockRequestedReviewers(params?.openUserRequestCount || 0, params?.openTeamRequestCount || 0)),
    });
  } else {
    return Promise.resolve({
      json: () => mockListOfPullRequests(params?.pullRequestCount || 0),
    });
  }
};
