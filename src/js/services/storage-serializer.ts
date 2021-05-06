import { PullRequestRecord, Issue } from '../types/types';

const StorageSerializer = () => {
  const storePullRequests = (pullRequests: PullRequestRecord): void => {
    for (const key in pullRequests) {
      storePullRequest(key, pullRequests[key]);
    }
  };

  const storePullRequest = (key: string, reviewRequested: Issue[]): void => {
    chrome.storage.local.set({ [key]: JSON.stringify(reviewRequested) });
  };

  const loadPullRequests = async (keys: string[]): Promise<PullRequestRecord> => {
    const record: PullRequestRecord = {};

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
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

    return JSON.parse(data[key]);
  };

  return { storePullRequests, loadPullRequests };
};

export default StorageSerializer;
