import { PullRequestRecord, Issue } from '../static/types';

const StorageSerializer = () => {
  const storePullRequests = (pullRequests: PullRequestRecord): void => {
    for (const key of Object.keys(pullRequests)) {
      storePullRequest(key, pullRequests[key]);
    }
  };

  const storePullRequest = (key: string, reviewRequested: Issue[]): void => {
    chrome.storage.local.set({ [key]: JSON.stringify(reviewRequested) });
  };

  const loadPullRequests = async (keys: string[]): Promise<PullRequestRecord> => {
    const record: PullRequestRecord = {};

    for (const key of keys) {
      record[key] = await loadPullRequest(key);
    }

    return record;
  };

  const loadPullRequest = async (key: string): Promise<Issue[]> => {
    const data: { [key: string]: string } = await new Promise((resolve) => {
      chrome.storage.local.get(key, (items) => {
        resolve(items);
      });
    });

    try { return JSON.parse(data[key]); }
    catch { return []; }
  };

  return { storePullRequests, loadPullRequests };
};

export default StorageSerializer;

