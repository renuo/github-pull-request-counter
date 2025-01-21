import { CounterConfig } from '../static/types';
import { PullRequestRecordKey } from '../static/constants';

const SettingsStorageAccessor = () => {
  const storeCounterConfig = (counter: CounterConfig): void => store('counter', JSON.stringify(counter));

  const loadCounterConfig = async (): Promise<CounterConfig> => {
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

  const storeScope = (list: string): void => store('scope', list);

  const loadScope = async (): Promise<string> => (await load('scope')) || '';

  const storeTeams = (list: string): void => store('teams', list);

  const loadTeams = async (): Promise<string> => (await load('teams')) || '';

  const storeIgnoredPrs = (list: string): void => store('ignored', list);

  const loadIgnoredPrs = async (): Promise<string> => (await load('ignored')) || '';

  const removeIgnoredPr = async (pr: string) => {
    const ignoredPrs = await loadIgnoredPrs();
    const newIgnoredPrs = ignoredPrs.split(',').filter((p) => p.trim() !== pr).join(',');
    storeIgnoredPrs(newIgnoredPrs);
  };

  const storeMaximumAge = (value: number): void => {
    store('maximumAge', value.toString());
  };

  const loadMaximumAge = async (): Promise<number> => parseInt(await load('maximumAge') || '999', 10);

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

  return {
    storeCounterConfig, loadCounterConfig, storeScope, loadScope, storeTeams, loadTeams, storeMaximumAge, loadMaximumAge,
    storeAccessToken, loadAccessToken, loadIgnoredPrs, storeIgnoredPrs, removeIgnoredPr,
  };
};

export default SettingsStorageAccessor;
