import { Issue } from '../../src/js/types/types';

export const mockListOfIssues = (count: number, params?: { assignee: string | undefined }) => {
  const createIssues = (count: number): Issue[] => {
    const items = [];

    for (let i = 0; i < count; i++) {
      items.push({
        id: Math.floor(Math.random() * 100),
        title: 'PR Title',
        assignee: params?.assignee,
        number: i,
        owner: 'renuo/github-pull-request-counter',
        pull_request: {
          url: `https://api.github.com/repos/renuo/github-pull-request-counter/pulls/${i+1}`,
          html_url: `https://github.com/renuo/github-pull-request-counter/pull/${i+1}`
        },
      });
    }

    return items;
  };

  return {
    total_count: count,
    items: createIssues(count)
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
    teams: createReviewers(teamsCount)
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
      json: () => Promise.resolve(mockRequestedReviewers(params?.openUserRequestCount || 0, params?.openTeamRequestCount || 0))
    });
  } else {
    return Promise.resolve({
      json: () => mockListOfIssues(params?.pullRequestCount || 0)
    });
  }
};
