import GithubApiWrapper from './services/github-api-wrapper';
import StorageSerializer from './services/storage-serializer';
import BadgeSetter from './services/badge-setter';
import SettingsSerializer from './services/settings-serializer';
import { recordKeys, noAccessTokenError, tooManyRequestsError } from './static/constants';
import { PullRequestRecord, PullRequest } from './static/types';

const pollingInterval = 1;

const ServiceWorker = () => {
  const fetchAndStoreData = async () => {
    let github;
    const storageSerilizer = StorageSerializer();

    try {
      github = await GithubApiWrapper();
    } catch(error) {
      if (error === noAccessTokenError) {
        storageSerilizer.storePullRequests({ noReviewRequested: [], allReviewsDone: [], missingAssignee: [], reviewRequested: [] });
        BadgeSetter().update({}, {});
        return;
      } else if (error === tooManyRequestsError) return;

      throw error;
    }

    let recordEntries: PullRequest[][];
    try {
      recordEntries = await Promise.all([
        github.getReviewRequested(),
        github.getNoReviewRequested(),
        github.getAllReviewsDone(),
        github.getMissingAssignee(),
      ]);
    } catch(error) {
      if (error === tooManyRequestsError) return;

      throw error;
    }

    const record: PullRequestRecord = {};
    recordKeys.forEach((key, index) => record[key] = recordEntries[index]);

    const counter = await SettingsSerializer().loadCounter();
    BadgeSetter().update(record, counter);

    storageSerilizer.storePullRequests(record);
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

