import { PullRequest, PullRequestRecord } from '../static/types';
import SettingsStorageAccessor from './settings-storage-accessor';
import { containsPullRequest, parsePullRequest } from '../static/utils.js';

const PullRequestStorageAccessor = () => {
  const storePullRequests = (pullRequests: PullRequestRecord): void => {
    for (const key of Object.keys(pullRequests)) {
      storePullRequest(key, pullRequests[key]);
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

    const tokens = ignoredPrsString.split(',').map(t => t.trim());
    const allPrs = Object.values(record).flat();
    const ignored: Partial<PullRequest>[] = [];

    for (const token of tokens) {
      if (token.startsWith('regex:')) {
        try {
          const regexPattern = token.substring(6); // Remove 'regex:' prefix
          const regex = new RegExp(regexPattern);
          // Find all PRs whose branch names match the pattern
          allPrs.forEach(pr => {
            if (pr.branchName && regex.test(pr.branchName)) {
              ignored.push(pr);
            }
          });
        } catch (e) {
          // Skip invalid regex patterns silently to maintain smooth UX
          continue;
        }
      } else {
        // Handle legacy format: owner/repo#number
        const parsed = parsePullRequest(token);
        if (containsPullRequest(allPrs, parsed)) {
          const found = allPrs.find(p => p.ownerAndName === parsed.ownerAndName && p.number === parsed.number);
          if (found) {
            ignored.push(found);
          }
        } else {
          // Remove non-existent PR from ignore list
          SettingsStorageAccessor().removeIgnoredPr(token);
        }
      }
    }

    return ignored;
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
