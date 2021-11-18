import GithubApiWrapper from './services/github-api-wrapper';
import PullRequestStorageAccessor from './services/pull-request-storage-accessor';
import BadgeSetter from './services/badge-setter';
import SettingsStorageAccessor from './services/settings-storage-accessor';
import { noAccessTokenError, tooManyRequestsError } from './static/constants';
import { PullRequestRecord, PullRequest } from './static/types';

const pollingInterval = 1;

const ServiceWorker = () => {
  const fetchAndStoreData = async () => {
    let github;
    const storage = PullRequestStorageAccessor();

    try {
      github = await GithubApiWrapper();
    } catch (error) {
      if (error === noAccessTokenError) {
        storage.clearPullRequests();
        BadgeSetter().clear();
        return;
      } else if (error === tooManyRequestsError) return;

      throw error;
    }

    let recordEntries: PullRequest[][];
    try {
      recordEntries = await Promise.all([
        github.getReviewRequested(),
        github.getTeamReviewRequested(),
        github.getNoReviewRequested(),
        github.getAllReviewsDone(),
        github.getMissingAssignee(),
        github.getAllAssigned(),
      ]);
    } catch (error) {
      if (error === tooManyRequestsError) return;

      throw error;
    }

    const record: PullRequestRecord = {
      reviewRequested: recordEntries[0],
      teamReviewRequested: recordEntries[1],
      noReviewRequested: recordEntries[2],
      allReviewsDone: recordEntries[3],
      missingAssignee: recordEntries[4],
      allAssigned: recordEntries[5],
    };

    const counter = await SettingsStorageAccessor().loadCounterConfig();
    BadgeSetter().update(record, counter);

    storage.storePullRequests(record);
  };

  const startPolling = async () => {
    await fetchAndStoreData();

    chrome.alarms.create('polling', { periodInMinutes: pollingInterval });

    // TODO: I cound't get any test to run this code properly.
    /* istanbul ignore next */
    chrome.alarms.onAlarm.addListener((alarm) => {
      /* istanbul ignore next */
      if (alarm.name === 'polling') fetchAndStoreData();
    });
  };

  return { fetchAndStoreData, startPolling };
};

// TODO: Running this code in tests will cause ERR_UNHANDLED_REJECTION.
/* istanbul ignore next */
if (process.env.JEST_WORKER_ID === undefined) ServiceWorker().startPolling();

export default ServiceWorker;
