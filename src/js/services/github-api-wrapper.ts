import { PullRequestRecordKey } from '../static/types.js';
import SettingsStorageAccessor from './settings-storage-accessor';
import { globalMock } from '../../../__test__/mocks/github-api-mock-data';
import { noAccessTokenError, tooManyRequestsError } from '../static/constants';

/**
 * @typedef {import('../static/types.js').PullRequest} PullRequest
 */

const GithubApiWrapper = async () => {
  /**
   * @returns {Promise<PullRequest[]>}
   */
  const getReviewRequested = async () => {
    const query = encodeURIComponent(`is:open is:pr review-requested:${userName} archived:false`);
    const pullRequests = await makeApiRequest('/search/issues', `q=${query}`);
    const processedPullRequests = await processDataIntoPullRequests(pullRequests.items, false);

    /** @type {string[]} */
    const teamPullRequestUrls = (await getTeamReviewRequested()).map(/** @param {PullRequest} pr */ pr => pr.url);
    return processedPullRequests.filter(/** @param {PullRequest} pr */ pr => !teamPullRequestUrls.includes(pr.url));
  };

  /**
   * @returns {Promise<Array<PullRequest>>}
   */
  const getTeamReviewRequested = async () => {
    const teams = await SettingsStorageAccessor().loadTeams();
    if (teams === '') return [];

    let combinedPullRequests = [];

    for (const team of teams.replace(/ /g, '').split(',')) {
      const query = encodeURIComponent(`is:open is:pr team-review-requested:${team} archived:false`);
      const pullRequests = await makeApiRequest('/search/issues', `q=${query}`);

      if (!pullRequests.errors) combinedPullRequests = combinedPullRequests.concat(pullRequests.items);
    }

    return processDataIntoPullRequests(combinedPullRequests, false);
  };

  /**
   * @returns {Promise<Array<PullRequest>>}
   */
  const getNoReviewRequested = async () => {
    return processDataIntoPullRequests(await searchMyIssues('review:none'));
  };

  /**
   * @returns {Promise<Array<PullRequest>>}
   */
  const getAllReviewsDone = async () => {
    return processDataIntoPullRequests(await searchMyIssues('-review:none'));
  };

  /**
   * @param {string} reviewModifier - Review status modifier for the search query
   * @returns {Promise<Array>}
   */
  const searchMyIssues = async (reviewModifier) => {
    const query = encodeURIComponent(`is:pr assignee:${userName} archived:false is:open ${reviewModifier}`);
    const response = await makeApiRequest('/search/issues', `q=${query}`);

    return asyncFilterIssues(response.items, async (PullRequest) => {
      const requestedReviewers = (await makeRequest(`${PullRequest.pull_request.url}/requested_reviewers`));
      return requestedReviewers.users.length + requestedReviewers.teams.length === 0;
    });
  };

  /**
   * @param {Array} pullRequests - Array of pull requests to filter
   * @param {Function} filter - Filter function to apply
   * @returns {Promise<Array>}
   */
  /**
   * @param {Array<Object>} pullRequests - Array of pull requests to filter
   * @param {(pr: Object) => Promise<boolean>} filter - Filter function to apply
   * @param {number} index - Index in the array
   * @returns {Promise<Array>}
   */
  const asyncFilterIssues = async (pullRequests, filter) => {
    /** @type {boolean[]} */
    const response = await Promise.all(pullRequests.map(filter));
    return pullRequests.filter((_, /** @type {number} */ index) => response[index]);
  };

  /**
   * @returns {Promise<Array<PullRequest>>}
   */
  const getMissingAssignee = async () => {
    const query = encodeURIComponent(`is:open is:pr author:${userName} draft:false archived:false`);
    let response = await makeApiRequest('/search/issues', `q=${query}`);
    response = response.items.filter((s) => !s.assignee);

    return processDataIntoPullRequests(response);
  };

  /**
   * @returns {Promise<Array<PullRequest>>}
   */
  const getAllAssigned = async () => {
    const query = encodeURIComponent(`is:open is:pr assignee:${userName} archived:false`);
    const response = await makeApiRequest('/search/issues', `q=${query}`);

    return processDataIntoPullRequests(response.items);
  };

  /**
   * @param {string} path - API endpoint path
   * @param {string} [params] - Optional query parameters
   * @returns {Promise<any>}
   */
  const makeApiRequest = async (path, params) => makeRequest(`https://api.github.com${path}`, params);

  /**
   * @param {string} path - Full API URL
   * @param {string} [params] - Optional query parameters
   * @returns {Promise<any>}
   */
  const makeRequest = async (path, params) => {
    // TODO: Find cleaner solution to mock the API during integration tests.
    /* istanbul ignore next */
    // @ts-ignore
    if (ENV === 'testing') return (await globalMock(`${path}?${params}`, { pullRequestCount: 3 })).json();
    const response = await fetch(`${path}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa(':' + accessToken),
      },
    });
    if (response.status === 403) throw tooManyRequestsError;
    else return response.json();
  };

  /**
   * @param {Array<any>} issues - Array of GitHub API issue objects
   * @param {boolean} [shouldFilterByMaximumAge=true] - Whether to filter by maximum age
   * @returns {Promise<Array<PullRequest>>}
   */
  const processDataIntoPullRequests = async (issues, shouldFilterByMaximumAge = true) => {
    issues = await filterByScope(issues);
    const pullRequests = issues.map(issue => ({
      id: 12,
      assignee: undefined,
      title: issue.title,
      number: issue.number,
      ownerAndName: readOwnerAndNameFromUrl(issue.pull_request.url),
      createdAt: issue.created_at,
      ageInDays: getDifferenceInDays(new Date(issue.created_at)),
      url: issue.pull_request.url,
      repositoryUrl: issue.pull_request.html_url.split('/pull')[0],
      htmlUrl: issue.pull_request.html_url,
      author: issue.user.login,
    }));

    const sorted = sortByDate(pullRequests);
    return shouldFilterByMaximumAge ? filterByMaximumAge(sorted) : sorted;
  };

  /**
   * @param {Array<any>} issues - Array of GitHub API issue objects
   * @returns {Promise<Array<any>>}
   */
  const filterByScope = async (issues) => {
    const scope = await SettingsStorageAccessor().loadScope();
    if (scope === '') return issues;

    const individualScopes = (scope).replace(' ', '').toLowerCase().split(',');
    return issues.filter(issue => (
      individualScopes.includes(readOwnerAndNameFromUrl(issue.pull_request.url).split('/')[0].toLowerCase())
    ));
  };

  /**
   * @param {PullRequest[]} pullRequests - Array of pull requests to sort
   * @returns {PullRequest[]}
   */
  /**
   * @param {Array<PullRequest>} pullRequests - Array of pull requests to sort
   * @param {PullRequest} pullRequest1 - First pull request to compare
   * @param {PullRequest} pullRequest2 - Second pull request to compare
   * @returns {Array<PullRequest>}
   */
  const sortByDate = (pullRequests) =>
    pullRequests.sort((pullRequest1, pullRequest2) => (
      new Date(pullRequest2.createdAt).getTime() - new Date(pullRequest1.createdAt).getTime()
    ));

  const readOwnerAndNameFromUrl = (url) => url.replace('https://api.github.com/repos/', '').split('/pulls/')[0];

  const filterByMaximumAge = async (pullRequests) => {
    const maximumAge = await SettingsStorageAccessor().loadMaximumAge();

    return pullRequests.filter(pullRequest => pullRequest.ageInDays < maximumAge);
  };

  /**
   * @param {Date} date2 - Date to compare with current time
   * @returns {number} - Difference in days
   */
  const getDifferenceInDays = (date2) => (Date.now() - date2.getTime()) / 86_400_000; // 1000 * 3600 * 24

  const accessToken = await SettingsStorageAccessor().loadAccessToken();
  // TODO: Find cleaner solution to mock the API during integration tests.
  // @ts-ignore
  if (ENV !== 'testing' && accessToken === '') throw noAccessTokenError;

  // TODO: This should be cached to improve performance
  const userName = (await makeApiRequest('/user')).login;

  return { getReviewRequested, getTeamReviewRequested, getNoReviewRequested, getAllReviewsDone, getMissingAssignee, getAllAssigned };
};

export default GithubApiWrapper;
