import githubApiWrapper from './services/github-api-wrapper';
// Todo: remove
// import { chrome } from 'jest-chrome'

const serviceWorker = async() => {
  const github = githubApiWrapper({});
  console.log(await github.getAllReviewsDone());
  console.log(await github.getMissingAssignee());
  console.log(await github.getNoReviewRequested());
  console.log(await github.getReviewRequested());
};

chrome.runtime.onStartup.addListener(() => {
  serviceWorker();
});

export default serviceWorker;

// chrome.runtime.onInstalled.addListener((details) => {
  //   // tslint:disable-next-line:no-console
  //   console.log('SW has been installed!');
  // });

chrome.alarms.create('Test', { periodInMinutes: 0.05 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'Test') {

    // tslint:disable-next-line:no-console
    console.log('SW is working 233');
    serviceWorker();
    // chrome.alarms.clear('Test');
  }
});
