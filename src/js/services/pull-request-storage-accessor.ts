import { PullRequestRecord, PullRequest, PullRequestRecordKey } from '../static/types';

const PullRequestStorageAccessor = () => {
  const storePullRequests = (pullRequests: PullRequestRecord): void => {
    for (const key of Object.keys(pullRequests)) {
      storePullRequest(key, pullRequests[key as PullRequestRecordKey]);
    }
  };

  const storePullRequest = (key: string, reviewRequested: PullRequest[]): void => {
    chrome.storage.local.set({ [key]: JSON.stringify(reviewRequested) });
  };

  const loadPullRequests = async (): Promise<PullRequestRecord> => ({
    reviewRequested: await loadPullRequest('reviewRequested'),
    noReviewRequested: await loadPullRequest('noReviewRequested'),
    allReviewsDone: await loadPullRequest('allReviewsDone'),
    missingAssignee: await loadPullRequest('missingAssignee'),
  });

  const loadPullRequest = async (key: string): Promise<PullRequest[]> => {
    const data: { [key: string]: string } = await new Promise((resolve) => {
      chrome.storage.local.get(key, (items) => {
        resolve(items);
      });
    });

    try { return JSON.parse(data[key]); }
    catch { return []; }
  };

  const clearPullRequests = (): void => {
    storePullRequests({ noReviewRequested: [], allReviewsDone: [], missingAssignee: [], reviewRequested: [] });
  };

  return { storePullRequests, loadPullRequests, clearPullRequests };
};

export default PullRequestStorageAccessor;

