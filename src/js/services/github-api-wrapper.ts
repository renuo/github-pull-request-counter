import { PullRequest } from '../static/types';
import SettingsSerializer from './settings-serializer';
import { globalMock } from '../../../__test__/mocks/github-api-mock-data';
import { noAccessTokenError, tooManyRequestsError } from '../static/constants';

const GithubApiWrapper = async () => {
  const getReviewRequested = async (): Promise<PullRequest[]> => {
    const query = encodeURIComponent(`is:open is:pr review-requested:${userName} archived:false`);
    const pullRequests = await makeApiRequest('/search/issues', `q=${query}`);

    return processDataIntoPullRequests(pullRequests.items);
  };

  const getNoReviewRequested = async (): Promise<PullRequest[]> => {
    return processDataIntoPullRequests(await searchPullRequests(''));
  };

  const getAllReviewsDone = async (): Promise<PullRequest[]> => {
    return processDataIntoPullRequests(await searchPullRequests('-'));
  };

  const searchPullRequests = async (reviewModifier: string): Promise<PullRequest[]> => {
    const query = encodeURIComponent(`is:pr assignee:${userName} archived:false is:open ${reviewModifier}review:none`);
    const response = await makeApiRequest('/search/issues', `q=${query}`);

    return asyncPullRequestFilter(response.items, async (PullRequest: PullRequest) => {
      const requestedReviewers = (await makeRequest(`${PullRequest.pull_request.url}/requested_reviewers`));
      return requestedReviewers.users.length + requestedReviewers.teams.length === 0;
    });
  };

  const asyncPullRequestFilter = async (pullRequests: PullRequest[], predicate: (PullRequest: PullRequest) => Promise<boolean>) => {
    const response = await Promise.all(pullRequests.map(predicate));
    return pullRequests.filter((_item, index) => response[index]);
  };

  const getMissingAssignee = async (): Promise<PullRequest[]> => {
    const query = encodeURIComponent(`is:open is:pr author:${userName} archived:false`);
    let response = await makeApiRequest('/search/issues', `q=${query}`);
    response = response.items.filter((s: PullRequest) => !s.assignee);

    return processDataIntoPullRequests(response);
  };

  const makeApiRequest = async (path: string, params?: string): Promise<any> => makeRequest(`https://api.github.com${path}`, params);

  const makeRequest = async (path: string, params?: string): Promise<any> => {
    // TODO: Find cleaner solution to mock the API during integration tests.
    /* istanbul ignore next */
    // @ts-ignore
    if (ENV === 'testing') return (await globalMock(`${path}?${params}`, { pullRequestCount: 3 })).json();
    const response = await fetch(`${path}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa(':' + accessToken)
      }
    });
    if (response.status === 403) throw tooManyRequestsError;
    else return response.json();
  };

  const processDataIntoPullRequests = async (pullRequests: PullRequest[]): Promise<PullRequest[]> => {
    pullRequests = await filterByScope(pullRequests);
    return pullRequests.map(pullRequest => ({
      id: 12,
      assignee: undefined,
      title: pullRequest.title,
      number: pullRequest.number,
      owner: readOwnerFromUrl(pullRequest.pull_request.url),
      pull_request: {
        url: pullRequest.pull_request.url,
        html_url: pullRequest.pull_request.html_url,
      }
    }));
  };

  const filterByScope = async (pullRequests: PullRequest[]): Promise<PullRequest[]> => {
    const scope = await SettingsSerializer().loadScope();
    if (scope === '') return pullRequests;

    const individualScopes = (scope).replace(' ', '').toLowerCase().split(',');
    return pullRequests.filter(pullRequest => (
      individualScopes.includes(readOwnerFromUrl(pullRequest.pull_request.url).split('/')[0].toLowerCase())
    ));
  };

  const readOwnerFromUrl = (url: string): string => url.replace('https://api.github.com/repos/', '').split('/pulls/')[0];

  const accessToken = await SettingsSerializer().loadAccessToken();
  // TODO: Find cleaner solution to mock the API during integration tests.
  // @ts-ignore
  if (ENV !== 'testing' && accessToken === '') throw noAccessTokenError;

  // TODO: This should be cached to improve performance
  const userName = (await makeApiRequest('/user')).login;

  return { getReviewRequested, getNoReviewRequested, getAllReviewsDone, getMissingAssignee };
};

export default GithubApiWrapper;
