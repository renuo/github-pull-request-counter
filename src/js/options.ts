import { CounterConfig } from './static/types';
import SettingsStorageAccessor from './services/settings-storage-accessor';
import ServiceWorker from './background';
import { displayedAccessToken } from './static/constants';
import '../css/options.scss';

const Options = () => {
  const settings= SettingsStorageAccessor();

  const init = () => {
    loadCounterToDOM();
    loadScopeToDOM();
    loadAccessTokenToDOM();
    document.getElementById('options-save')!.addEventListener('click', saveButtonClickHandler);
  };

  const loadCounterToDOM = async () => {
    const counter = await settings.loadCounterConfig();
    (document.getElementById('review-requested') as HTMLInputElement).checked = counter.reviewRequested;
    (document.getElementById('no-review-requested') as HTMLInputElement).checked = counter.noReviewRequested;
    (document.getElementById('all-reviews-done') as HTMLInputElement).checked = counter.allReviewsDone;
    (document.getElementById('missing-assignee') as HTMLInputElement).checked = counter.missingAssignee;
    (document.getElementById('all-assigned') as HTMLInputElement).checked = counter.allAssigned;
  };

  const loadScopeToDOM = async () => {
    const scope = await settings.loadScope();
    (document.getElementById('account-names') as HTMLInputElement).value = scope;
  };

  const loadAccessTokenToDOM = async () => {
    const accessToken = await settings.loadAccessToken();
    if (accessToken !== '') {
      (document.getElementById('access-token') as HTMLInputElement).value = displayedAccessToken;
    }
  };

  const saveButtonClickHandler = async () => {
    storeCounterFromDOM();
    storeScopeFromDOM();
    storeAccessTokenFromDom();
    await ServiceWorker().fetchAndStoreData();
  };

  const storeCounterFromDOM = () => {
    const counter: CounterConfig = {
      reviewRequested: (document.getElementById('review-requested') as HTMLInputElement).checked,
      noReviewRequested: (document.getElementById('no-review-requested') as HTMLInputElement).checked,
      allReviewsDone: (document.getElementById('all-reviews-done') as HTMLInputElement).checked,
      missingAssignee: (document.getElementById('missing-assignee') as HTMLInputElement).checked,
      allAssigned: (document.getElementById('all-assigned') as HTMLInputElement).checked,
    };

    settings.storeCounterConfig(counter);
  };

  const storeScopeFromDOM = () => {
    const scope = (document.getElementById('account-names') as HTMLInputElement).value;
    settings.storeScope(scope);
  };

  const storeAccessTokenFromDom = () => {
    const accessToken = (document.getElementById('access-token') as HTMLInputElement).value;
    if (accessToken !== displayedAccessToken) {
      settings.storeAccessToken(accessToken);
    }
  };

  return { init, saveButtonClickHandler };
};

// TODO: Running this code in tests will cause ERR_UNHANDLED_REJECTION.
/* istanbul ignore next */
if (process.env.JEST_WORKER_ID === undefined) Options().init();

export default Options;
