import { Issue } from '../types/types';
import fetch from 'node-fetch';

const env = process.env;


const makeRequest = async (path: string, params?: string) => {
  return await (await fetch(`https://api.github.com${path}?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(env.USERNAME! + ":" + env.ACCESS_TOKEN!).toString('base64')
    }
  })).json();
}

const makeRequestFullURL = async (path: string, params?: string) => {
  return await (await fetch(`${path}?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(env.USERNAME! + ":" + env.ACCESS_TOKEN!).toString('base64')
    }
  })).json();
}

// https://advancedweb.hu/how-to-use-async-functions-with-array-filter-in-javascript/
// TODO: Replace any
const asyncFilter = async (array: [], predicate: (item: any) => Promise<boolean>) => {
  const results = await Promise.all(array.map(predicate));

  return array.filter((_item, index) => results[index]);
}

// TODO: remove any
const issuesToHtmlUrl = (array: any) => {
  // @ts-ignore
  return array.map(issue => issue.pull_request.html_url);
}

interface GithubApiWrapperProps {

}

export interface GithubApiWrapper {
  authenticateUser: () => boolean;
  getReviewRequested: () => Promise<string[]>;
  getNoReviewRequested: () => Promise<string[]>;
  getAllReviewsDone: () => Promise<string[]>;
  getMissingAssignee: () => Promise<string[]>;
}

const githubApiWrapper = (props: GithubApiWrapperProps): GithubApiWrapper => {

  const authenticateUser = () => {
    // chrome.tabs.create({ url: `https://github.com/login/oauth/authorize?client_id=${env.CLIENT_ID}` });
    return true;
  }

  const getReviewRequested = async () => {
    const query = encodeURIComponent('is:open is:pr review-requested:Janis-Leuenberger archived:false');
    const issues = await makeRequest('/search/issues', `q=${query}`);

    return issuesToHtmlUrl(issues.data.items);
  }

  const getNoReviewRequested = async () => {
    return issuesToHtmlUrl(await searchIssues(''));
  }

  const getAllReviewsDone = async () => {
    return issuesToHtmlUrl(await searchIssues('-'));
  }

  const searchIssues = async (reviewModifier: string) => {
    const q = encodeURIComponent(`is:pr assignee:Janis-Leuenberger archived:false is:open ${reviewModifier}reviews:none`);
    let noReviews = (await makeRequest('/search/issues', `q=${q}`)).data;

    const f = await asyncFilter(noReviews.items, async (issue: any) => {
      let asd = (await makeRequestFullURL(`${issue.pull_request.url}/requested_reviewers`)).data;
      return asd.users.length + asd.teams.length === 0;
    });

    return f;
  }

  const getMissingAssignee = async () => {
    const q = encodeURIComponent('is:open is:pr author:Janis-Leuenberger archived:false');
    let pulls = (await makeRequest('/search/issues', `q=${q}`)).data;
    pulls = pulls.items.filter((s: Issue) => !s.assignee);

    return issuesToHtmlUrl(pulls);
  }

  return { authenticateUser, getReviewRequested, getNoReviewRequested, getAllReviewsDone, getMissingAssignee };
}

export default githubApiWrapper
