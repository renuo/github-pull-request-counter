import { Issue } from '../../src/js/types/types';

export const mockListOfIssues = (count: number, params?: { assignee: string | undefined }) => {
  const createIssues = (count: number): Issue[] => {
    const items = [];

    for (let i = 0; i < count; i++) {
      items.push({
        id: Math.floor(Math.random() * 100),
        assignee: params?.assignee,
        pull_request: {
          url: `https://api.github.com/repos/renuo/github-pull-request-counter/pulls/${count}`,
          html_url: `https://github.com/renuo/github-pull-request-counter/pull/${count}`
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
