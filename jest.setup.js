// Set test environment
process.env.ENV = 'testing';

// Set up mocks after Jest is loaded
beforeAll(() => {
  // Mock fetch globally
  global.fetch = jest.fn();
  
  // Mock btoa
  global.btoa = (data) => Buffer.from(data).toString('base64');

  // Set up chrome mock implementations
  global.chrome.storage.local.get = jest.fn();
  global.chrome.storage.local.set = jest.fn();
  global.chrome.action.setBadgeText = jest.fn();
  global.chrome.action.setBadgeBackgroundColor = jest.fn();
  global.chrome.alarms.create = jest.fn();
  global.chrome.alarms.onAlarm.addListener = jest.fn();
});
