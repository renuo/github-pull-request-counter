/**
 * @typedef {import('../../src/js/static/types').Issue} Issue
 */

/**
 * @param {number} count
 * @param {{ assignee?: string, created_at?: number }} [params]
 * @returns {Promise<{ total_count: number, items: Issue[] }>}
 */
export const mockListOfPullRequests = (count, params) => {
  /**
   * @param {number} count
   * @returns {Issue[]}
   */
  const createIssues = (count) => {
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
  };

  return {
    total_count: count,
    items: createIssues(count),
  };
};

/**
 * @param {number} usersCount
 * @param {number} teamsCount
 * @returns {{ users: Array<{id: number}>, teams: Array<{id: number}> }}
 */
export const mockRequestedReviewers = (usersCount, teamsCount) => {
  /** @returns {number} */
  const createRandomID = () => Math.floor(Math.random() * 100);

  /**
   * @param {number} count
   * @returns {Array<{id: number}>}
   */
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
 * @property {number} [pullRequestCount]
 * @property {number} [openUserRequestCount]
 * @property {number} [openTeamRequestCount]
 */

/**
 * @param {string} url
 * @param {GlobalMockParams} [params]
 * @returns {Promise<{ json: () => Promise<any> }>}
 */
export const globalMock = (url, params) => {
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
