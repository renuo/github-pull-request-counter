import { Counter } from './static/types';
import SettingsSerializer from './services/settings-serializer';
import ServiceWoker from './background';
import GithubApiWrapper from './services/github-api-wrapper';
import '../css/options.scss';

const Options = () => {
  const settingsSerializer = SettingsSerializer();

  const init = () => {
    loadCounterToDOM();
    loadScopeToDOM();
    loadAccessTokenToDOM();
    addButtonEventListener();
  };

  const loadCounterToDOM = async () => {
    const counter = await settingsSerializer.loadCounter();
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
    if (accessToken !== "") {
      (document.getElementById('access-token') as HTMLInputElement).value = 'ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    }
  }

  const addButtonEventListener = () => {
    document.getElementById('options-save')!.addEventListener('click', async() => {
      storeCounterFromDOM();
      storeScopeFromDOM();
      storeAccessTokenFromDom();
      ServiceWoker().fetchAndStoreData();
    });
  };

  const storeCounterFromDOM = () => {
    const counter: Counter = {
      reviewRequested: (document.getElementById('review-requested') as HTMLInputElement).checked,
      noReviewRequested: (document.getElementById('no-review-requested') as HTMLInputElement).checked,
      allReviewsDone: (document.getElementById('all-reviews-done') as HTMLInputElement).checked,
      missingAssignee: (document.getElementById('missing-assignee') as HTMLInputElement).checked
    };

    settingsSerializer.storeCounter(counter);
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
  }

  return { init };
};

Options().init();

export default Options;
