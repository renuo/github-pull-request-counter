import { PullRequestRecordKey } from '../static/constants';
import SettingsStorageAccessor from './settings-storage-accessor';
import { containsPullRequest, parsePullRequest } from '../static/utils.js';
import { PullRequest, PullRequestRecord } from '../static/types';

const PullRequestStorageAccessor = () => {
  const storePullRequests = (pullRequests: PullRequestRecord) => {
    for (const key of Object.keys(pullRequests)) {
      storePullRequest(PullRequestRecordKey[key as keyof typeof PullRequestRecordKey], pullRequests[key as keyof PullRequestRecord]);
    }
  };

  const storePullRequest = (key: string, pullRequest: PullRequest[]) => {
    chrome.storage.local.set({ [key]: JSON.stringify(pullRequest) });
  };

  const loadPullRequests = async () => ({
    [PullRequestRecordKey.reviewRequested]: await loadPullRequest(PullRequestRecordKey.reviewRequested),
    [PullRequestRecordKey.teamReviewRequested]: await loadPullRequest(PullRequestRecordKey.teamReviewRequested),
    [PullRequestRecordKey.noReviewRequested]: await loadPullRequest(PullRequestRecordKey.noReviewRequested),
    [PullRequestRecordKey.allReviewsDone]: await loadPullRequest(PullRequestRecordKey.allReviewsDone),
    [PullRequestRecordKey.missingAssignee]: await loadPullRequest(PullRequestRecordKey.missingAssignee),
    [PullRequestRecordKey.allAssigned]: await loadPullRequest(PullRequestRecordKey.allAssigned),
  });

  const loadPullRequest = async (key: string): Promise<PullRequest[]> => {
    const data = await new Promise<{ [key: string]: string }>((resolve) => {
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

  const clearPullRequests = () => {
    const emptyRecord: PullRequestRecord = {
      [PullRequestRecordKey.noReviewRequested]: [] as PullRequest[],
      [PullRequestRecordKey.teamReviewRequested]: [] as PullRequest[],
      [PullRequestRecordKey.allReviewsDone]: [] as PullRequest[],
      [PullRequestRecordKey.missingAssignee]: [] as PullRequest[],
      [PullRequestRecordKey.reviewRequested]: [] as PullRequest[],
      [PullRequestRecordKey.allAssigned]: [] as PullRequest[],
    };
    storePullRequests(emptyRecord);
  };

  return { storePullRequests, loadPullRequests, clearPullRequests, syncIgnoredPrs, parsePullRequest };
};

export default PullRequestStorageAccessor;
