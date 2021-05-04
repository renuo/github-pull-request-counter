chrome.runtime.onInstalled.addListener((details) => {
  // tslint:disable-next-line:no-console
  console.log('SW has been installed!');
});

chrome.alarms.create('Test', { periodInMinutes: 0.1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'Test') {
    // tslint:disable-next-line:no-console
    console.log('SW is working');
  }
});
