// Creates a mock list of pull requests
export const mockListOfPullRequests = (count, params) => {
    // Creates an array of mock issues
  function createIssues(count) {
    const items = [];

    for (let i = 0; i < count; i++) {
      items.push({
        id: Math.floor(Math.random() * 100),
        title: 'PR Title',
        assignee: params?.assignee,
        number: i+1,
        created_at: params?.created_at || Date.now(),
        repository_url: 'https://api.github.com/repos/renuo/github-pull-request-counter',
        pull_request: {
          url: `https://api.github.com/repos/renuo/github-pull-request-counter/pulls/${i+1}`,
          html_url: `https://github.com/renuo/github-pull-request-counter/pull/${i+1}`,
        },
        user: {
          login: 'coorasse',
        },
      });
    }

    return items;
  }

  return {
    total_count: count,
    items: createIssues(count),
  };
};

// Creates mock reviewer objects for users and teams
export const mockRequestedReviewers = (usersCount, teamsCount) => {

  const createRandomID = () => Math.floor(Math.random() * 100);

  const createReviewers = (count) => {
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

// Mock API response for pull request data
export const globalMock = (url, params) => {
  if (url.includes('/requested_reviewers')) {
    return Promise.resolve({
      json: () => Promise.resolve(mockRequestedReviewers(params?.openUserRequestCount || 0, params?.openTeamRequestCount || 0)),
    });
  } else {
    return Promise.resolve({
      json: () => mockListOfPullRequests(params?.pullRequestCount || 0, {}),
    });
  }
};
