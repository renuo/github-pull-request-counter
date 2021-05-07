import { Issue } from '../static/types';

// const env = process.env;
const env = {
  USERNAME: 'Janis-Leuenberger',
  ACCESS_TOKEN: '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'
};

const makeRequest = async (path: string, params?: string) => {
  return (await fetch(`https://api.github.com${path}?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + btoa(env.USERNAME! + ':' + env.ACCESS_TOKEN!)
    }
  })).json();
};

const makeRequestFullURL = async (path: string, params?: string) => {
  return (await fetch(`${path}?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + btoa(env.USERNAME! + ':' + env.ACCESS_TOKEN!)
    }
  })).json();
};

// https://advancedweb.hu/how-to-use-async-functions-with-array-filter-in-javascript/
// TODO: Replace any
const asyncFilter = async (array: [], predicate: (item: any) => Promise<boolean>) => {
  const results = await Promise.all(array.map(predicate));

  return array.filter((_item, index) => results[index]);
};

const readOwnerFromUrl = (url: string): string => {
  let owner = url.replace('https://api.github.com/repos/', '');
  owner = owner.split('/pulls/')[0];
  return owner;
};

const removeUselessDataFromIssues = (issues: Issue[]): Issue[] => (
  issues.map(issue => ({
    id: 12,
    assignee: undefined,
    title: issue.title,
    number: issue.number,
    owner: readOwnerFromUrl(issue.pull_request.url),
    pull_request: {
      url: issue.pull_request.url,
      html_url: issue.pull_request.html_url,
    }
  }))
);

export interface GithubApiWrapper {
  // authenticateUser: () => boolean;
  getReviewRequested: () => Promise<Issue[]>;
  getNoReviewRequested: () => Promise<Issue[]>;
  getAllReviewsDone: () => Promise<Issue[]>;
  getMissingAssignee: () => Promise<Issue[]>;
}

const githubApiWrapper = (): GithubApiWrapper => {

  // const authenticateUser = () => {
  //   // chrome.tabs.create({ url: `https://github.com/login/oauth/authorize?client_id=${env.CLIENT_ID}` });
  //   return true;
  // };

  const getReviewRequested = async () => {
    const query = encodeURIComponent('is:open is:pr review-requested:Janis-Leuenberger archived:false');
    const issues = await makeRequest('/search/issues', `q=${query}`);

    return removeUselessDataFromIssues(issues.items);
  };

  const getNoReviewRequested = async () => {
    return removeUselessDataFromIssues(await searchIssues(''));
  };

  const getAllReviewsDone = async () => {
    return removeUselessDataFromIssues(await searchIssues('-'));
  };

  const searchIssues = async (reviewModifier: string) => {
    const q = encodeURIComponent(`is:pr assignee:Janis-Leuenberger archived:false is:open ${reviewModifier}review:none`);
    const noReviews = (await makeRequest('/search/issues', `q=${q}`));

    const f = await asyncFilter(noReviews.items, async (issue: any) => {
      const asd = (await makeRequestFullURL(`${issue.pull_request.url}/requested_reviewers`));
      return asd.users.length + asd.teams.length === 0;
    });

    return f;
  };

  const getMissingAssignee = async () => {
    const q = encodeURIComponent('is:open is:pr author:Janis-Leuenberger archived:false');
    let pulls = (await makeRequest('/search/issues', `q=${q}`));
    pulls = pulls.items.filter((s: Issue) => !s.assignee);

    return removeUselessDataFromIssues(pulls);
  };

  return { getReviewRequested, getNoReviewRequested, getAllReviewsDone, getMissingAssignee };
};

export default githubApiWrapper;
