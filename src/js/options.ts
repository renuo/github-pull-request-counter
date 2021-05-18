import { CounterSettings } from './static/types';
import SettingsSerializer from './services/settings-serializer';
import ServiceWorker from './background';
import '../css/options.scss';

const Options = () => {
  const settingsSerializer = SettingsSerializer();

  const init = () => {
    loadCounterToDOM();
    loadScopeToDOM();
    loadAccessTokenToDOM();
    document.getElementById('options-save')!.addEventListener('click', saveButtonClickHandler);
  };

  const loadCounterToDOM = async () => {
    const counter = await settingsSerializer.loadCounterSettings();
    (document.getElementById('review-requested') as HTMLInputElement).checked = counter.reviewRequested;
    (document.getElementById('no-review-requested') as HTMLInputElement).checked = counter.noReviewRequested;
    (document.getElementById('all-reviews-done') as HTMLInputElement).checked = counter.allReviewsDone;
    (document.getElementById('missing-assignee') as HTMLInputElement).checked = counter.missingAssignee;
  };

  const loadScopeToDOM = async () => {
    const scope = await settingsSerializer.loadScope();
    (document.getElementById('account-names') as HTMLInputElement).value = scope;
  };

  const loadAccessTokenToDOM = async () => {
    const accessToken = await settingsSerializer.loadAccessToken();
    if (accessToken !== '') {
      (document.getElementById('access-token') as HTMLInputElement).value = 'ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    }
  };

  const saveButtonClickHandler = async () => {
    storeCounterFromDOM();
    storeScopeFromDOM();
    storeAccessTokenFromDom();
    await ServiceWorker().fetchAndStoreData();
  };

  const storeCounterFromDOM = () => {
    const counter: CounterSettings = {
      reviewRequested: (document.getElementById('review-requested') as HTMLInputElement).checked,
      noReviewRequested: (document.getElementById('no-review-requested') as HTMLInputElement).checked,
      allReviewsDone: (document.getElementById('all-reviews-done') as HTMLInputElement).checked,
      missingAssignee: (document.getElementById('missing-assignee') as HTMLInputElement).checked
    };

    settingsSerializer.storeCounterSettings(counter);
  };

  const storeScopeFromDOM = () => {
    const scope = (document.getElementById('account-names') as HTMLInputElement).value;
    settingsSerializer.storeScope(scope);
  };

  const storeAccessTokenFromDom = () => {
    const accessToken = (document.getElementById('access-token') as HTMLInputElement).value;
    if (accessToken !== 'ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX') {
      settingsSerializer.storeAccessToken(accessToken);
    }
  };

  return { init, saveButtonClickHandler };
};

// TODO: Running this code in tests will cause ERR_UNHANDLED_REJECTION.
/* istanbul ignore next */
if (process.env.JEST_WORKER_ID === undefined) Options().init();

export default Options;
