chrome.alarms.create('Test', { periodInMinutes: 0.5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'Test') {
    // tslint:disable-next-line:no-console
    console.log('SW is working')
  }
});
