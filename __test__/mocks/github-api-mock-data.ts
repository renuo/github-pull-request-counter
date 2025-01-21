/**
 * @typedef {Object} Issue
 * @property {number} id
 * @property {string} [assignee]
 * @property {string} title
 * @property {number} number
 * @property {number} created_at
 * @property {string} repository_url
 * @property {{ url: string, html_url: string }} pull_request
 * @property {{ login: string }} user
 */

/**
 * Creates a mock list of pull requests
 * @param {number} count - Number of pull requests to mock
 * @param {{ assignee?: string, created_at?: number }} [params] - Optional parameters
 * @returns {{ total_count: number, items: Array<import('../../src/js/static/types.js').Issue> }}
 */
/** @type {function(number, { assignee?: string, created_at?: number }): { total_count: number, items: Array<import('../../src/js/static/types.js').Issue> }} */
export const mockListOfPullRequests = (count, params) => {
    /**
     * @param {number} count
     * @returns {Array<Issue>}
     */
  /** @type {function(number): Array<Issue>} */
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

/**
 * @param {number} usersCount - Number of user reviewers
 * @param {number} teamsCount - Number of team reviewers
 * @returns {Object} Mock reviewers object
 */
/**
 * @param {number} usersCount - Number of user reviewers to create
 * @param {number} teamsCount - Number of team reviewers to create
 * @returns {{ users: Array<{id: number}>, teams: Array<{id: number}> }}
 */
export const mockRequestedReviewers = (usersCount, teamsCount) => {
  /** @returns {number} */
  const createRandomID = () => Math.floor(Math.random() * 100);

  /** @param {number} count */
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

/**
 * @typedef {Object} GlobalMockParams
 * @property {number} [pullRequestCount] - Number of pull requests to mock
 * @property {number} [openUserRequestCount] - Number of open user requests
 * @property {number} [openTeamRequestCount] - Number of open team requests
 */

/**
 * @param {string} url - URL to mock
 * @param {GlobalMockParams} [params] - Mock parameters
 * @returns {Promise<{ json: () => any }>}
 */
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
