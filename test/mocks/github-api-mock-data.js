export const mockListOfPullRequests = (count, params = {}) => {
  const createIssues = (count) => {
    const items = [];

    for (let i = 0; i < count; i++) {
      items.push({
        id: Math.floor(Math.random() * 100),
        title: 'PR Title',
        assignee: params.assignee,
        number: i+1,
        created_at: params.created_at || Date.now(),
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
  };

  return {
    total_count: count,
    items: createIssues(count),
  };
};

// Builds the GraphQL PullRequest nodes returned by a `search(type: ISSUE)`
// field. `params.reviewRequests` / `params.assignees` set the totalCount used
// by the wrapper to reproduce the old `/requested_reviewers` filtering.
export const mockPullRequestNodes = (count, params = {}) => {
  const nodes = [];
  for (let i = 0; i < count; i++) {
    nodes.push({
      number: i + 1,
      title: 'PR Title',
      url: `https://github.com/renuo/github-pull-request-counter/pull/${i + 1}`,
      createdAt: params.createdAt || new Date(Date.now()).toISOString(),
      isDraft: params.isDraft || false,
      author: { login: 'coorasse' },
      assignees: { totalCount: params.assignees === undefined ? 0 : params.assignees },
      reviewRequests: { totalCount: params.reviewRequests === undefined ? 0 : params.reviewRequests },
      repository: {
        nameWithOwner: 'renuo/github-pull-request-counter',
        url: 'https://github.com/renuo/github-pull-request-counter',
      },
    });
  }
  return nodes;
};

// Builds a full GraphQL response. Every aliased search field returns the same
// set of nodes unless overridden via `aliases`.
export const mockGraphqlResponse = (nodes, aliases = {}) => {
  const searchAliases = ['reviewRequested', 'noReviewRequested', 'allReviewsDone', 'missingAssignee', 'allAssigned'];
  const data = { viewer: { login: 'sislr' } };

  for (const alias of searchAliases) {
    data[alias] = { nodes: aliases[alias] || nodes };
  }
  for (const [alias, value] of Object.entries(aliases)) {
    if (!searchAliases.includes(alias)) data[alias] = { nodes: value };
  }

  return { data };
};

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

// GraphQL-shaped mock used by the background/integration tests. Every fetch
// (the `viewer` lookup and the batched query) resolves to the same response.
export const globalMock = (_url, params = {}) => (
  Promise.resolve({
    status: 200,
    json: () => Promise.resolve(mockGraphqlResponse(mockPullRequestNodes(params.pullRequestCount || 0))),
  })
);
