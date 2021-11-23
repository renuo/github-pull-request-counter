import { PullRequestRecord, PullRequest, PullRequestRecordKey } from '../static/types';

const PullRequestStorageAccessor = () => {
  const storePullRequests = (pullRequests: PullRequestRecord): void => {
    for (const key of Object.keys(pullRequests)) {
      storePullRequest(key, pullRequests[key as PullRequestRecordKey]);
    }
  };

  const storePullRequest = (key: string, pullRequest: PullRequest[]): void => {
    chrome.storage.local.set({ [key]: JSON.stringify(pullRequest) });
  };

  const loadPullRequests = async (): Promise<PullRequestRecord> => ({
    reviewRequested: await loadPullRequest('reviewRequested'),
    teamReviewRequested: await loadPullRequest('teamReviewRequested'),
    noReviewRequested: await loadPullRequest('noReviewRequested'),
    allReviewsDone: await loadPullRequest('allReviewsDone'),
    missingAssignee: await loadPullRequest('missingAssignee'),
    allAssigned: await loadPullRequest('allAssigned'),
  });

  const loadPullRequest = async (key: string): Promise<PullRequest[]> => {
    const data: { [key: string]: string } = await new Promise((resolve) => {
      chrome.storage.local.get(key, (items) => {
        resolve(items);
      });
    });

    return data[key] ? JSON.parse(data[key]) : [];
  };

  const clearPullRequests = (): void => {
    storePullRequests({
      noReviewRequested: [],
      teamReviewRequested: [],
      allReviewsDone: [],
      missingAssignee: [],
      reviewRequested: [],
      allAssigned: [],
    });
  };

  return { storePullRequests, loadPullRequests, clearPullRequests };
};

export default PullRequestStorageAccessor;
