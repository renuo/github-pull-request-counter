const SettingsStorageAccessor = () => {
  const storeCounterConfig = (counter) => store('counter', JSON.stringify(counter));

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

  const storeIgnoredTitles = (regex) => store('ignoredTitles', regex);

  const loadIgnoredPrs = async () => (await load('ignored')) || '';
  const loadIgnoredTitles = async () => (await load('ignoredTitles')) || '';

  const removeIgnoredPr = async (pr) => {
    const ignoredPrs = await loadIgnoredPrs();
    const newIgnoredPrs = ignoredPrs.split(',').filter((p) => p.trim() !== pr).join(',');
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
    storeIgnoredTitles, loadIgnoredTitles,
  };
};

export default SettingsStorageAccessor;
