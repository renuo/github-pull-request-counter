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
  let settingsSerializer = SettingsSerializer();

  describe('storeCounter', () => {
    it('calls get with the correct arguments', () => {
      let counter = {
        'one': true,
        'two': false
      };

      settingsSerializer.storeCounter(counter);
      expect(set).toHaveBeenCalledWith({ counter: JSON.stringify(counter) });
    })
  })

  describe('loadCounter', () => {
    it('loads the correct data', async () => {
      let counter = {
        'one': true,
        'two': false
      };

      global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({ 'counter': JSON.stringify(counter) }));

      let result = await settingsSerializer.loadCounter();
      expect(result).toEqual(result);
    })

    describe('with nothing in the storage', () => {
      it('returns the default values', async () => {
        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({}));

        let result = await settingsSerializer.loadCounter();
        expect(result).toEqual({
          reviewRequested: true,
          noReviewRequested: true,
          allReviewsDone: true,
          missingAssignee: true
        });
      })
    });
  })

  describe('storeScope', () => {
    it('calls get with the correct arguments', () => {
      let scope = 'renuo, github';

      settingsSerializer.storeScope(scope);
      expect(set).toHaveBeenCalledWith({ scope });
    })
  })

  describe('loadScope', () => {
    it('loads the correct data', async () => {
      let scope = 'renuo, github';

      global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({ 'scope': scope }));

      let result = await settingsSerializer.loadScope();
      expect(result).toEqual(scope);
    })

    describe('with nothing in the storage', () => {
      it('returns the default values', async () => {
        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({}));

        let result = await settingsSerializer.loadScope();
        expect(result).toEqual('');
      })
    });
  })
})
