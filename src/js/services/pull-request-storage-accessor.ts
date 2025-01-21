import { PullRequestRecordKey } from '../static/types.js';
import SettingsStorageAccessor from './settings-storage-accessor';
import { containsPullRequest, parsePullRequest } from '../static/utils.js';

const PullRequestStorageAccessor = () => {
  /**
   * @param {Object.<string, Array>} pullRequests - Record of pull requests
   */
  const storePullRequests = (pullRequests) => {
    for (const key of Object.keys(pullRequests)) {
      storePullRequest(key, pullRequests[key]);
    }
  };

  /**
   * @param {string} key - Key for storage
   * @param {Array} pullRequest - Array of pull request objects
   */
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

  /**
   * @param {string} key - Key to load from storage
   * @returns {Promise<Array>} Array of pull request objects
   */
  /**
   * @param {string} key - Key to load from storage
   * @returns {Promise<Array>} Array of pull request objects
   */
  const loadPullRequest = async (key) => {
    /** @type {{ [key: string]: string }} */
    const data = await new Promise((resolve) => {
      chrome.storage.local.get(key, (items) => {
        resolve(items);
      });
    });

    /** @type {string|undefined} */
    const value = data[key];
    return value ? JSON.parse(value) : [];
  };

  /**
   * @param {Object.<string, Array>} record - Record of pull requests
   * @returns {Promise<Array>} Array of ignored pull request objects
   */
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

  /** @returns {void} */
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
