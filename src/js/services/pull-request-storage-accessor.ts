import { IgnoredPr, PullRequest, PullRequestRecord, PullRequestRecordKey } from '../static/types';
import SettingsStorageAccessor from './settings-storage-accessor';
import { containsPullRequest, parsePullRequest } from '../static/utils';

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

  const syncIgnoredPrs = async (record: PullRequestRecord): Promise<Partial<PullRequest>[]> => {
    const ignoredPrsString = await SettingsStorageAccessor().loadIgnoredPrs();
    if (!ignoredPrsString.length) {
      return [];
    }

    const ignoredPrs = ignoredPrsString.split(',').map(parsePullRequest);
    const allPrs = Object.values(record).flat();

    return ignoredPrs.filter(pr => {
      const isPresent = containsPullRequest(allPrs, pr);

      if (!isPresent) {
        SettingsStorageAccessor().removeIgnoredPr(`${pr.ownerAndName}#${pr.number}`);
      }

      return isPresent;
    });
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

  return { storePullRequests, loadPullRequests, clearPullRequests, syncIgnoredPrs, parsePullRequest };
};

export default PullRequestStorageAccessor;
