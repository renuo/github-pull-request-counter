import { CounterConfig } from '../static/types';

const SettingsStorageAccessor = () => {
  const storeCounterConfig = (counter: CounterConfig): void => store('counter', JSON.stringify(counter));

  const loadCounterConfig = async (): Promise<CounterConfig> => {
    const counterJSON = await load('counter');
    if (counterJSON) {
      return JSON.parse(counterJSON);
    } else {
      return {
        reviewRequested: true,
        noReviewRequested: true,
        allReviewsDone: true,
        missingAssignee: true,
        allAssigned: false,
      };
    }
  };

  const storeScope = (list: string): void => store('scope', list);

  const loadScope = async (): Promise<string> => (await load('scope')) || '';

  const storeAccessToken = (accessToken: string): void => store('accessToken', accessToken);

  const loadAccessToken = async (): Promise<string> => (await load('accessToken')) || '';

  const store = (key: string, value: string): void => chrome.storage.local.set({ [key]: value });

  const load = async (key: string): Promise<string> => {
    const data: { [key: string]: string } = await new Promise((resolve) => {
      chrome.storage.local.get(key, (items) => {
        resolve(items);
      });
    });

    return data[key];
  };

  return { storeCounterConfig, loadCounterConfig, storeScope, loadScope, storeAccessToken, loadAccessToken };
};

export default SettingsStorageAccessor;
