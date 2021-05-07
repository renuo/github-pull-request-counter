import githubApiWrapper from './services/github-api-wrapper';
import StorageSerializer from './services/storage-serializer';
import BadgeSetter from './services/badge-setter';

// TODO: put somewhere else
const pollingInterval = 1;

const ServiceWoker = () => {
  const fetchAndStoreData = async () => {
    const github = githubApiWrapper();

    // TODO: check if this is async
    const objectToSerialize = {
      noReviewRequested: await github.getNoReviewRequested(),
      allReviewsDone: await github.getAllReviewsDone(),
      missingAssignee: await github.getMissingAssignee(),
      reviewRequested: await github.getReviewRequested()
    };

    BadgeSetter().update(objectToSerialize);

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

