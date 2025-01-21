import { PullRequestRecordKey } from '../static/types.js';

const SettingsStorageAccessor = () => {
  /**
   * @param {{ [key: string]: boolean }} counter - Counter configuration
   */
  /** @type {(counter: { [key: string]: boolean }) => void} */
  /**
   * @param {{ [key: string]: boolean }} counter - Counter configuration object
   * @returns {void}
   */
  /** @type {function({ [key: string]: boolean }): void} */
  /** @param {{ [key: string]: boolean }} counter */
  const storeCounterConfig = (counter) => store('counter', JSON.stringify(counter));

  /**
   * @returns {Promise<{ [key: string]: boolean }>}
   */
  const loadCounterConfig = async () => {
    const counterJSON = await load('counter');
    if (counterJSON) {
      return JSON.parse(counterJSON);
    } else {
      return {
        reviewRequested: true,
        teamReviewRequested: true,
        noReviewRequested: true,
        allReviewsDone: true,
        missingAssignee: true,
        allAssigned: false,
      };
    }
  };

  /**
   * @param {string} list - Scope list
   */
  /** @type {(list: string) => void} */
  const storeScope = (list) => store('scope', list);

  /** @type {() => Promise<string>} */
  const loadScope = async () => (await load('scope')) || '';

  /** @type {(list: string) => void} */
  const storeTeams = (list) => store('teams', list);

  /** @type {() => Promise<string>} */
  const loadTeams = async () => (await load('teams')) || '';

  /** @type {(list: string) => void} */
  const storeIgnoredPrs = (list) => store('ignored', list);

  /** @type {() => Promise<string>} */
  const loadIgnoredPrs = async () => (await load('ignored')) || '';

  /** @type {(pr: string) => Promise<void>} */
  /**
   * @param {string} pr - Pull request identifier to remove
   * @returns {Promise<void>}
   */
  /** @type {function(string): Promise<void>} */
  /** @param {string} pr */
  const removeIgnoredPr = async (pr) => {
    const ignoredPrs = await loadIgnoredPrs();
    /** @type {(p: string) => boolean} */
    /**
     * @param {string} p
     * @returns {boolean}
     */
  /** @type {function(string): boolean} */
    const filterPr = (p) => {
    return p.trim() !== pr;
  };
    const newIgnoredPrs = ignoredPrs.split(',').filter(filterPr).join(',');
    storeIgnoredPrs(newIgnoredPrs);
  };

  /**
   * @param {number} value - Maximum age value
   */
  /** @param {number} value */
  const storeMaximumAge = (value) => {
    store('maximumAge', value.toString());
  };

  /**
   * @returns {Promise<number>}
   */
  const loadMaximumAge = async () => parseInt(await load('maximumAge') || '999', 10);

  /**
   * @param {string} accessToken - GitHub access token
   */
  /** @param {string} accessToken */
  const storeAccessToken = (accessToken) => store('accessToken', accessToken);

  /**
   * @returns {Promise<string>}
   */
  const loadAccessToken = async () => (await load('accessToken')) || '';

  /**
   * @param {string} key - Storage key
   * @param {string} value - Storage value
   */
  /** @type {(key: string, value: string) => void} */
  /** 
   * @param {string} key 
   * @param {string} value 
   */
  const store = (key, value) => chrome.storage.local.set({ [key]: value });

  /**
   * @param {string} key - Storage key
   * @returns {Promise<string>}
   */
  /** @type {(key: string) => Promise<string>} */
  const load = async (key) => {
    /** @type {{ [key: string]: string }} */
    const data = await new Promise((resolve) => {
      chrome.storage.local.get(key, (items) => {
        resolve(items);
      });
    });

    return data[key];
  };

  return {
    storeCounterConfig, loadCounterConfig, storeScope, loadScope, storeTeams, loadTeams, storeMaximumAge, loadMaximumAge,
    storeAccessToken, loadAccessToken, loadIgnoredPrs, storeIgnoredPrs, removeIgnoredPr,
  };
};

export default SettingsStorageAccessor;
