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

  const storeScope = (list) => store('scope', list);

  const loadScope = async () => (await load('scope')) || '';

  const storeTeams = (list) => store('teams', list);

  const loadTeams = async () => (await load('teams')) || '';

  const storeIgnoredPrs = (list) => store('ignored', list);

  const loadIgnoredPrs = async () => (await load('ignored')) || '';

  const removeIgnoredPr = async (pr) => {
    const ignoredPrs = await loadIgnoredPrs();
    const filterPr = (p) => {
      return p.trim() !== pr;
    };
    const newIgnoredPrs = ignoredPrs.split(',').filter(filterPr).join(',');
    storeIgnoredPrs(newIgnoredPrs);
  };

  const storeMaximumAge = (value) => {
    store('maximumAge', value.toString());
  };

  const loadMaximumAge = async () => parseInt(await load('maximumAge') || '999', 10);

  const storeAccessToken = (accessToken) => store('accessToken', accessToken);

  const loadAccessToken = async () => (await load('accessToken')) || '';

  const store = (key, value) => chrome.storage.local.set({ [key]: value });

  const load = async (key) => {
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
