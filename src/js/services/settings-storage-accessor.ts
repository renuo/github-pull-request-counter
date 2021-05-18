import { CounterSettings } from '../static/types';

const SettingsStorageAccessor = () => {
  const storeCounterSettings = (counter: CounterSettings): void => {
    store('counter', JSON.stringify(counter));
  };

  const loadCounterSettings = async (): Promise<CounterSettings> => {
    try {
      return (JSON.parse(await load('counter')));
    } catch {
      return {
        reviewRequested: true,
        noReviewRequested: true,
        allReviewsDone: true,
        missingAssignee: true,
      };
    }
  };

  const storeScope = (list: string): void => {
    store('scope', list);
  };

  const loadScope = async (): Promise<string> => {
    const scope = await load('scope');
    return scope === undefined ? '' : scope;
  };

  const storeAccessToken = (accessToken: string): void => {
    store('accessToken', accessToken);
  };

  const loadAccessToken = async (): Promise<string> => {
    const accessToken = await load('accessToken');
    return accessToken === undefined ? '' : accessToken;
  };

  const store = (key: string, value: string): void => {
    chrome.storage.local.set({ [key]: value });
  };

  const load = async (key: string): Promise<string> => {
    const data: { [key: string]: string } = await new Promise((resolve) => {
      chrome.storage.local.get(key, (items) => {
        resolve(items);
      });
    });

    return data[key];
  };

  return { storeCounterSettings, loadCounterSettings, storeScope, loadScope, storeAccessToken, loadAccessToken };
};

export default SettingsStorageAccessor;