import { Issue } from '../static/types';
import SettingsSerializer from './settings-serializer';

const GithubApiWrapper = () => {
  const getReviewRequested = async (): Promise<Issue[]> => {
    const query = encodeURIComponent('is:open is:pr review-requested:Janis-Leuenberger archived:false');
    const issues = await makeApiRequest('/search/issues', `q=${query}`);

    return processDataIntoIssues(issues.items);
  };

  const getNoReviewRequested = async (): Promise<Issue[]> => {
    return processDataIntoIssues(await searchIssues(''));
  };

  const getAllReviewsDone = async (): Promise<Issue[]> => {
    return processDataIntoIssues(await searchIssues('-'));
  };

  const searchIssues = async (reviewModifier: string): Promise<Issue[]> => {
    const query = encodeURIComponent(`is:pr assignee:Janis-Leuenberger archived:false is:open ${reviewModifier}review:none`);
    const response = await makeApiRequest('/search/issues', `q=${query}`);

    return asyncIssueFilter(response.items, async (issue: Issue) => {
      const asd = (await makeRequest(`${issue.pull_request.url}/requested_reviewers`));
      return asd.users.length + asd.teams.length === 0;
    });
  };

  const asyncIssueFilter = async (issues: Issue[], predicate: (issue: Issue) => Promise<boolean>) => {
    const response = await Promise.all(issues.map(predicate));
    return issues.filter((_item, index) => response[index]);
  };

  const getMissingAssignee = async (): Promise<Issue[]> => {
    const query = encodeURIComponent('is:open is:pr author:Janis-Leuenberger archived:false');
    let response = await makeApiRequest('/search/issues', `q=${query}`);
    response = response.items.filter((s: Issue) => !s.assignee);

    return processDataIntoIssues(response);
  };

  const makeApiRequest = async (path: string, params?: string): Promise<any> => makeRequest(`https://api.github.com${path}`, params);

  const makeRequest = async (path: string, params?: string): Promise<any> => {
    const response = await fetch(`${path}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa(process.env.USERNAME! + ':' + process.env.ACCESS_TOKEN!)
      }
    });

    if (response.status === 403) throw new Error('Too many requests');
    else return response.json();
  };

  const processDataIntoIssues = async (issues: Issue[]): Promise<Issue[]> => {
    issues = await filterByScope(issues);
    return issues.map(issue => ({
      id: 12,
      assignee: undefined,
      title: issue.title,
      number: issue.number,
      owner: readOwnerFromUrl(issue.pull_request.url),
      pull_request: {
        url: issue.pull_request.url,
        html_url: issue.pull_request.html_url,
      }
    }));
  };

  const filterByScope = async (issues: Issue[]): Promise<Issue[]> => {
    const scope = await SettingsSerializer().loadScope();
    if (scope === '') return issues;

    const individualScopes = (scope).replace(' ', '').toLowerCase().split(',');
    return issues.filter(issue => individualScopes.includes(readOwnerFromUrl(issue.pull_request.url).split('/')[0].toLowerCase()));
  };

  const readOwnerFromUrl = (url: string): string => url.replace('https://api.github.com/repos/', '').split('/pulls/')[0];

  return { getReviewRequested, getNoReviewRequested, getAllReviewsDone, getMissingAssignee };
};

export default GithubApiWrapper;
