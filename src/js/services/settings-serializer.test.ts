import SettingsSerializer from './settings-serializer';

global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    }
  }
} as any;
const set = global.chrome.storage.local.set;

describe('StorageSerializer', () => {
  const settingsSerializer = SettingsSerializer();

  describe('storeCounter', () => {
    it('calls get with the correct arguments', () => {
      const counter = {
        'one': true,
        'two': false
      };

      settingsSerializer.storeCounter(counter);
      expect(set).toHaveBeenCalledWith({ counter: JSON.stringify(counter) });
    });
  });

  describe('loadCounter', () => {
    it('loads the correct data', async () => {
      const counter = {
        'one': true,
        'two': false
      };

      global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({
        'counter': JSON.stringify(counter)
      }));

      const result = await settingsSerializer.loadCounter();
      expect(result).toEqual(result);
    });

    describe('with nothing in the storage', () => {
      it('returns the default values', async () => {
        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({}));

        const result = await settingsSerializer.loadCounter();
        expect(result).toEqual({
          reviewRequested: true,
          noReviewRequested: true,
          allReviewsDone: true,
          missingAssignee: true
        });
      });
    });
  });

  describe('storeScope', () => {
    it('calls get with the correct arguments', () => {
      const scope = 'renuo, github';

      settingsSerializer.storeScope(scope);
      expect(set).toHaveBeenCalledWith({ scope });
    });
  });

  describe('loadScope', () => {
    it('loads the correct data', async () => {
      const scope = 'renuo, github';

      global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({ 'scope': scope }));

      const result = await settingsSerializer.loadScope();
      expect(result).toEqual(scope);
    });

    describe('with nothing in the storage', () => {
      it('returns the default values', async () => {
        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({}));

        const result = await settingsSerializer.loadScope();
        expect(result).toEqual('');
      });
    });
  });

  describe('storeAccessToken', () => {
    it('calls get with the correct arguments', () => {
      const accessToken = 'secret';

      settingsSerializer.storeAccessToken(accessToken);
      expect(set).toHaveBeenCalledWith({ accessToken });
    });
  });

  describe('loadAccessToken', () => {
    it('loads the correct data', async () => {
      const accessToken = 'renuo, github';

      global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({
        'accessToken': accessToken
      }));

      const result = await settingsSerializer.loadAccessToken();
      expect(result).toEqual(accessToken);
    });

    describe('with nothing in the storage', () => {
      it('returns the default values', async () => {
        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({}));

        const result = await settingsSerializer.loadAccessToken();
        expect(result).toEqual('');
      });
    });
  });
});
