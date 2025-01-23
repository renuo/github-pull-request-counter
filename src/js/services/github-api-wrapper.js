import { noAccessTokenError, tooManyRequestsError } from '../static/constants.js';
import SettingsStorageAccessor from './settings-storage-accessor.js';
import { globalMock } from '../../../__test__/mocks/github-api-mock-data';

const GithubApiWrapper = async () => {
  const getReviewRequested = async () => {
    const query = encodeURIComponent(`is:open is:pr review-requested:${userName} archived:false`);
    const pullRequests = await makeApiRequest('/search/issues', `q=${query}`);
    const processedPullRequests = await processDataIntoPullRequests(pullRequests.items, false);

    const teamPullRequestUrls = (await getTeamReviewRequested()).map(pr => pr.url);
    return processedPullRequests.filter((pr) => !teamPullRequestUrls.includes(pr.url));
  };

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

  const getNoReviewRequested = async () => {
    return processDataIntoPullRequests(await searchMyIssues('review:none'));
  };

  const getAllReviewsDone = async () => {
    return processDataIntoPullRequests(await searchMyIssues('-review:none'));
  };

  const searchMyIssues = async (reviewModifier) => {
    const query = encodeURIComponent(`is:pr assignee:${userName} archived:false is:open ${reviewModifier}`);
    const response = await makeApiRequest('/search/issues', `q=${query}`);

    return asyncFilterIssues(response.items, async (PullRequest) => {
      const requestedReviewers = (await makeRequest(`${PullRequest.pull_request.url}/requested_reviewers`));
      return requestedReviewers.users.length + requestedReviewers.teams.length === 0;
    });
  };

  const asyncFilterIssues = async (pullRequests, filter) => {
    const response = await Promise.all(pullRequests.map(filter));
    return pullRequests.filter((_item, index) => response[index]);
  };

  const getMissingAssignee = async () => {
    const query = encodeURIComponent(`is:open is:pr author:${userName} draft:false archived:false`);
    let response = await makeApiRequest('/search/issues', `q=${query}`);
    response = response.items.filter((s) => !s.assignee);

    return processDataIntoPullRequests(response);
  };

  const getAllAssigned = async () => {
    const query = encodeURIComponent(`is:open is:pr assignee:${userName} archived:false`);
    const response = await makeApiRequest('/search/issues', `q=${query}`);

    return processDataIntoPullRequests(response.items);
  };

  const makeApiRequest = async (path, params) => makeRequest(`https://api.github.com${path}`, params);

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

  const filterByScope = async (issues) => {
    const scope = await SettingsStorageAccessor().loadScope();
    if (scope === '') return issues;

    const individualScopes = (scope).replace(' ', '').toLowerCase().split(',');
    return issues.filter(issue => (
      individualScopes.includes(readOwnerAndNameFromUrl(issue.pull_request.url).split('/')[0].toLowerCase())
    ));
  };

  const sortByDate = (pullRequests) =>
    pullRequests.sort((pullRequest1, pullRequest2) => (
      new Date(pullRequest2.createdAt).getTime() - new Date(pullRequest1.createdAt).getTime()
    ));

  const readOwnerAndNameFromUrl = (url) => url.replace('https://api.github.com/repos/', '').split('/pulls/')[0];

  const filterByMaximumAge = async (pullRequests) => {
    const maximumAge = await SettingsStorageAccessor().loadMaximumAge();

    return pullRequests.filter(pullRequest => pullRequest.ageInDays < maximumAge);
  };

  const getDifferenceInDays = (date2) => (Date.now() - date2.getTime()) / 86_400_000; // 1000 * 3600 * 24

  const accessToken = await SettingsStorageAccessor().loadAccessToken();
  // TODO: Find cleaner solution to mock the API during integration tests.
  if (ENV !== 'testing' && accessToken === '') throw noAccessTokenError;

  // TODO: This should be cached to improve performance
  const userName = (await makeApiRequest('/user')).login;

  return { getReviewRequested, getTeamReviewRequested, getNoReviewRequested, getAllReviewsDone, getMissingAssignee, getAllAssigned };
};

export default GithubApiWrapper;
