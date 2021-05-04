import { Issue } from '../../src/js/types/types';

export const mockListOfIssues = (count: number, params?: { assignee: string | undefined }) => {
  const createIssues = (count: number): Issue[] => {
    const items = [];

    for (let i = 0; i < count; i++) {
      items.push({
        id: Math.floor(Math.random() * 100),
        assignee: params?.assignee,
        pull_request: {
          url: `https://api.github.com/repos/renuo/github-pull-request-counter/pulls/${i+1}`,
          html_url: `https://github.com/renuo/github-pull-request-counter/pull/${i+1}`
        },
      });
    }

    return items;
  }

  return {
    status: 200,
    statusText: 'OK',
    data: {
      total_count: count,
      items: createIssues(count)
    }
  }
};

export const mockRequestedReviewers = (usersCount: number, teamsCount: number) => {
  const createRandomID = (): number => Math.floor(Math.random() * 100);

  const createReviewers = (count: number) => {
    let reviewer = [];
    for (let i = 0; i < count; i++) {
      reviewer.push({ id: createRandomID() });
    }
    return reviewer;
  }

  return {
    status: 200,
    statusText: 'OK',
    data: {
      users: createReviewers(usersCount),
      teams: createReviewers(teamsCount)
    }
  };
}

export const globalMock = (url: string, params?: { pullRequestCount?: number, openUserRequestCount?: number, openTeamRequestCount?: number }) => {
  if (url.includes('/requested_reviewers')) {
    return Promise.resolve(mockRequestedReviewers(params?.openUserRequestCount || 0, params?.openTeamRequestCount || 0));
  } else {
    return Promise.resolve(mockListOfIssues(params?.pullRequestCount || 0));
  }
}
