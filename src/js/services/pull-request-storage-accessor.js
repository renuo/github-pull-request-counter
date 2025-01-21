import SettingsStorageAccessor from './settings-storage-accessor.js';
import { containsPullRequest, parsePullRequest } from '../static/utils.js';

const PullRequestStorageAccessor = () => {
  const storePullRequests = (pullRequests) => {
    for (const key of Object.keys(pullRequests)) {
      storePullRequest(key, pullRequests[key]);
    }
  };

  const storePullRequest = (key, pullRequest) => {
    chrome.storage.local.set({ [key]: JSON.stringify(pullRequest) });
  };

  const loadPullRequests = async () => ({
    reviewRequested: await loadPullRequest('reviewRequested'),
    teamReviewRequested: await loadPullRequest('teamReviewRequested'),
    noReviewRequested: await loadPullRequest('noReviewRequested'),
    allReviewsDone: await loadPullRequest('allReviewsDone'),
    missingAssignee: await loadPullRequest('missingAssignee'),
    allAssigned: await loadPullRequest('allAssigned'),
  });

  const loadPullRequest = async (key) => {
    const data = await new Promise((resolve) => {
      chrome.storage.local.get(key, (items) => {
        resolve(items);
      });
    });

    return data[key] ? JSON.parse(data[key]) : [];
  };

  const syncIgnoredPrs = async (record) => {
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
