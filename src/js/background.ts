import GithubApiWrapper from './services/github-api-wrapper';
import StorageSerializer from './services/storage-serializer';
import BadgeSetter from './services/badge-setter';
import SettingsSerializer from './services/settings-serializer';

// TODO: put somewhere else
const pollingInterval = 1;

const ServiceWoker = () => {
  const fetchAndStoreData = async () => {
    const github = GithubApiWrapper();

    // TODO: make this async
    const objectToSerialize = {
      noReviewRequested: await github.getNoReviewRequested(),
      allReviewsDone: await github.getAllReviewsDone(),
      missingAssignee: await github.getMissingAssignee(),
      reviewRequested: await github.getReviewRequested()
    };

    const counter = await SettingsSerializer().loadCounter();
    BadgeSetter().update(objectToSerialize, counter);

    const storageSerilizer = StorageSerializer();
    storageSerilizer.storePullRequests(objectToSerialize);
  };

  const startPolling = async() => {
    await fetchAndStoreData();

    chrome.alarms.create('polling', { periodInMinutes: pollingInterval });

    // TODO: I cound't get any tests to run this code properly. I tried using a spy on fetchAndStoreData and making the code synchronous.
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
if (process.env.JEST_WORKER_ID === undefined) ServiceWoker().startPolling();

export default ServiceWoker;

