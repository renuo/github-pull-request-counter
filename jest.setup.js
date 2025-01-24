// Mock chrome.storage.local
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
  action: {
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn(),
  },
  alarms: {
    create: jest.fn(),
    onAlarm: {
      addListener: jest.fn(),
    },
  },
};

// Mock fetch globally
global.fetch = jest.fn();

// Mock btoa
global.btoa = (data) => Buffer.from(data).toString('base64');

// Set test environment
process.env.ENV = 'testing';
