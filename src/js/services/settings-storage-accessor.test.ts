import SettingsStorageAccessor from './settings-storage-accessor';

global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
} as any;
const set = global.chrome.storage.local.set;

describe('SettingsStorageAccessor', () => {
  const settings = SettingsStorageAccessor();

  describe('storeCounterConfig', () => {
    it('calls get with the correct arguments', () => {
      const counter = {
        reviewRequested: false,
        teamReviewRequested: true,
        noReviewRequested: false,
        allReviewsDone: true,
        missingAssignee: false,
        allAssigned: true,
      };

      settings.storeCounterConfig(counter);
      expect(set).toHaveBeenCalledWith({ counter: JSON.stringify(counter) });
    });
  });

  describe('loadCounterConfig', () => {
    it('loads the correct data', async () => {
      const counter = {
        reviewRequested: false,
        teamReviewRequested: true,
        noReviewRequested: false,
        allReviewsDone: true,
        missingAssignee: false,
        allAssigned: true,
      };

      global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({
        'counter': JSON.stringify(counter),
      }));

      const result = await settings.loadCounterConfig();
      expect(result).toEqual(result);
    });

    describe('with nothing in the storage', () => {
      it('returns the default values', async () => {
        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({}));

        const result = await settings.loadCounterConfig();
        expect(result).toEqual({
          reviewRequested: true,
          teamReviewRequested: true,
          noReviewRequested: true,
          allReviewsDone: true,
          missingAssignee: true,
          allAssigned: false,
        });
      });
    });
  });

  describe('storeScope', () => {
    it('calls get with the correct arguments', () => {
      const scope = 'renuo, github';

      settings.storeScope(scope);
      expect(set).toHaveBeenCalledWith({ scope });
    });
  });

  describe('loadScope', () => {
    it('loads the correct data', async () => {
      const scope = 'renuo, github';

      global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({ 'scope': scope }));

      const result = await settings.loadScope();
      expect(result).toEqual(scope);
    });

    describe('with nothing in the storage', () => {
      it('returns the default values', async () => {
        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({}));

        const result = await settings.loadScope();
        expect(result).toEqual('');
      });
    });
  });

  describe('storeMaximumAge', () => {
    it('calls get with the correct arguments', () => {
      const value = 777;

      settings.storeMaximumAge(value);
      expect(set).toHaveBeenCalledWith({ maximumAge: value.toString() });
    });
  });

  describe('loadMaximumAge', () => {
    it('loads the correct data', async () => {
      const value = 777;

      global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback(
        {
          'maximumAge': value,
        },
      ));

      const result = await settings.loadMaximumAge();
      expect(result).toEqual(value);
    });

    describe('with nothing in the storage', () => {
      it('returns the default values', async () => {
        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({}));

        const result = await settings.loadMaximumAge();
        expect(result).toEqual(999);
      });
    });
  });

  describe('storeAccessToken', () => {
    it('calls get with the correct arguments', () => {
      const accessToken = 'secret';

      settings.storeAccessToken(accessToken);
      expect(set).toHaveBeenCalledWith({ accessToken });
    });
  });

  describe('loadAccessToken', () => {
    it('loads the correct data', async () => {
      const accessToken = 'renuo, github';

      global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({
        'accessToken': accessToken,
      }));

      const result = await settings.loadAccessToken();
      expect(result).toEqual(accessToken);
    });

    describe('with nothing in the storage', () => {
      it('returns the default values', async () => {
        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({}));

        const result = await settings.loadAccessToken();
        expect(result).toEqual('');
      });
    });
  });
});
