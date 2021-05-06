import githubApiWrapper from './services/github-api-wrapper';
import StorageSerializer from './services/storage-serializer';

const serviceWorker = async() => {
  const github = githubApiWrapper({});

  const objectToSerialize = {
    'noReviewRequested': await github.getNoReviewRequested(),
    'allReviewsDone': await github.getAllReviewsDone(),
    'missingAssignee': await github.getMissingAssignee(),
    'reviewRequested': await github.getReviewRequested()
  }

  const storageSerilizer = StorageSerializer();
  storageSerilizer.storePullRequests(objectToSerialize);

  // console.log(objectToSerialize);
  // console.log(await storageSerilizer.loadPullRequests(Object.keys(objectToSerialize)));
};

chrome.runtime.onStartup.addListener(() => {
  serviceWorker();
});

export default serviceWorker;

console.log('SW is started');
serviceWorker();
// chrome.runtime.onInstalled.addListener((details) => {
  //   // tslint:disable-next-line:no-console
  //   console.log('SW has been installed!');
  // });

// chrome.alarms.create('Test', { periodInMinutes: 0.2 });

// chrome.alarms.onAlarm.addListener((alarm) => {
//   if (alarm.name === 'Test') {

//     // tslint:disable-next-line:no-console
//     console.log('SW is working');
//     serviceWorker();
//     // chrome.alarms.clear('Test');
//   }
// });
