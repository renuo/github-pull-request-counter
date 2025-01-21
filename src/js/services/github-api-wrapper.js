import SettingsStorageAccessor from './settings-storage-accessor.js';
import { globalMock } from '../../../__test__/mocks/github-api-mock-data.js';
import { noAccessTokenError, tooManyRequestsError } from '../static/constants.js';

const GithubApiWrapper = async () => {
  /** @returns {Promise<import('../static/types').PullRequest[]>} */
  const getReviewRequested = async () => {
    const query = encodeURIComponent(`is:open is:pr review-requested:${userName} archived:false`);
    const pullRequests = await makeApiRequest('/search/issues', `q=${query}`);
    const processedPullRequests = await processDataIntoPullRequests(pullRequests.items, false);

    const teamPullRequestUrls = (await getTeamReviewRequested()).map(pr => pr.url);
    return processedPullRequests.filter((pr) => !teamPullRequestUrls.includes(pr.url));
  };

  /** @returns {Promise<import('../static/types').PullRequest[]>} */
  const getTeamReviewRequested = async () => {
    const teams = await SettingsStorageAccessor().loadTeams();
    if (teams === '') return [];

    /** @type {import('../static/types').Issue[]} */
    let combinedPullRequests = [];

    for (const team of teams.replace(/ /g, '').split(',')) {
      const query = encodeURIComponent(`is:open is:pr team-review-requested:${team} archived:false`);
      const pullRequests = await makeApiRequest('/search/issues', `q=${query}`);

      if (!pullRequests.errors) combinedPullRequests = combinedPullRequests.concat(pullRequests.items);
    }

    return processDataIntoPullRequests(combinedPullRequests, false);
  };

  /** @returns {Promise<import('../static/types').PullRequest[]>} */
  const getNoReviewRequested = async () => {
    return processDataIntoPullRequests(await searchMyIssues('review:none'));
  };

  /** @returns {Promise<import('../static/types').PullRequest[]>} */
  const getAllReviewsDone = async () => {
    return processDataIntoPullRequests(await searchMyIssues('-review:none'));
  };

  /**
   * @param {string} reviewModifier
   * @returns {Promise<import('../static/types').Issue[]>}
   */
  const searchMyIssues = async (reviewModifier) => {
    const query = encodeURIComponent(`is:pr assignee:${userName} archived:false is:open ${reviewModifier}`);
    const response = await makeApiRequest('/search/issues', `q=${query}`);

    return asyncFilterIssues(response.items, /** @param {import('../static/types').Issue} PullRequest */ async (PullRequest) => {
      const requestedReviewers = (await makeRequest(`${PullRequest.pull_request.url}/requested_reviewers`));
      return requestedReviewers.users.length + requestedReviewers.teams.length === 0;
    });
  };

  /**
   * @param {import('../static/types').Issue[]} pullRequests
   * @param {(issue: import('../static/types').Issue) => Promise<boolean>} filter
   * @returns {Promise<import('../static/types').Issue[]>}
   */
  const asyncFilterIssues = async (pullRequests, filter) => {
    const response = await Promise.all(pullRequests.map(filter));
    return pullRequests.filter((_item, index) => response[index]);
  };

  /** @returns {Promise<import('../static/types').PullRequest[]>} */
  const getMissingAssignee = async () => {
    const query = encodeURIComponent(`is:open is:pr author:${userName} draft:false archived:false`);
    let response = await makeApiRequest('/search/issues', `q=${query}`);
    response = response.items.filter(/** @param {import('../static/types').PullRequest} s */ (s) => !s.assignee);

    return processDataIntoPullRequests(response);
  };

  /** @returns {Promise<import('../static/types').PullRequest[]>} */
  const getAllAssigned = async () => {
    const query = encodeURIComponent(`is:open is:pr assignee:${userName} archived:false`);
    const response = await makeApiRequest('/search/issues', `q=${query}`);

    return processDataIntoPullRequests(response.items);
  };

  const makeApiRequest = async (path, params) => makeRequest(`https://api.github.com${path}`, params);

  /**
   * @param {string} path
   * @param {string} [params]
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
   * @param {import('../static/types').Issue[]} issues
   * @param {boolean} [shouldFilterByMaximumAge=true]
   * @returns {Promise<import('../static/types').PullRequest[]>}
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
   * @param {import('../static/types').Issue[]} issues
   * @returns {Promise<import('../static/types').Issue[]>}
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
   * @param {import('../static/types').PullRequest[]} pullRequests
   * @returns {import('../static/types').PullRequest[]}
   */
  const sortByDate = (pullRequests) =>
    pullRequests.sort((pullRequest1, pullRequest2) => (
      new Date(pullRequest2.createdAt).getTime() - new Date(pullRequest1.createdAt).getTime()
    ));

  const readOwnerAndNameFromUrl = (url) => url.replace('https://api.github.com/repos/', '').split('/pulls/')[0];

  /**
   * @param {import('../static/types').PullRequest[]} pullRequests
   * @returns {Promise<import('../static/types').PullRequest[]>}
   */
  const filterByMaximumAge = async (pullRequests) => {
    const maximumAge = await SettingsStorageAccessor().loadMaximumAge();

    return pullRequests.filter(pullRequest => pullRequest.ageInDays < maximumAge);
  };

  /**
   * @param {Date} date2
   * @returns {number}
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
