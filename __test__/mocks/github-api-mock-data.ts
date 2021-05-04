interface Issue {
  id: number,
  pull_request: {
    url: string,
    html_url: string
  }
}

const createIssues = (count: number): Issue[] => {
  const items = [];

  for (let i = 0; i < count; i++) {
    items.push({
      id: Math.floor(Math.random() * 100),
      pull_request: {
        url: `https://api.github.com/repos/renuo/github-pull-request-counter/pulls/${count}`,
        html_url: `https://github.com/renuo/github-pull-request-counter/pull/${count}`
      },
    });
  }

  return items;
}

const createRandomID = (): number => Math.floor(Math.random() * 100);

export const reviewerGetReviewRequestedMockData = (count: number) => {
  return {
    status: 200,
    statusText: 'OK',
    data: {
      total_count: count,
      items: createIssues(count)
    }
  }
};

export const assigneeGetNoReviewRequestedMockData = (count: number) => {
  return {
    status: 200,
    statusText: 'OK',
    data: {
      total_count: count,
      items: createIssues(count)
    }
  }
}

export const assigneeGetNoReviewRequestedMockDataRequestedReviewers = (usersCount: number, teamsCount: number) => {
  // TODO implement counts
  // TODO: rename
  return {
    status: 200,
    statusText: 'OK',
    data: {
      users: [
        {
          id: createRandomID()
        }
      ],
      teams: [
        {
          id: createRandomID()
        }
      ]
    }
  };
}
