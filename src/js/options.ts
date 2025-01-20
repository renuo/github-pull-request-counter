import { CounterConfig } from './static/types';
import SettingsStorageAccessor from './services/settings-storage-accessor';
import ServiceWorker from './background';
import { displayedAccessToken } from './static/constants';

const Options = () => {
  const settings = SettingsStorageAccessor();

  const init = () => {
    loadCounterToDOM();
    loadMaximumAgeFromDOM();
    loadScopeToDOM();
    loadTeamsToDOM();
    loadAccessTokenToDOM();
    loadIgnoredPrsToDOM();
    document.getElementById('options-save')!.addEventListener('click', saveButtonClickHandler);
  };

  const loadCounterToDOM = async () => {
    const counter = await settings.loadCounterConfig();
    (document.getElementById('review-requested') as HTMLInputElement).checked = counter.reviewRequested;
    (document.getElementById('team-review-requested') as HTMLInputElement).checked = counter.teamReviewRequested;
    (document.getElementById('no-review-requested') as HTMLInputElement).checked = counter.noReviewRequested;
    (document.getElementById('all-reviews-done') as HTMLInputElement).checked = counter.allReviewsDone;
    (document.getElementById('missing-assignee') as HTMLInputElement).checked = counter.missingAssignee;
    (document.getElementById('all-assigned') as HTMLInputElement).checked = counter.allAssigned;
  };

  const loadScopeToDOM = async () => {
    const scope = await settings.loadScope();
    (document.getElementById('account-names') as HTMLInputElement).value = scope;
  };

  const loadTeamsToDOM = async () => {
    const teams = await settings.loadTeams();
    (document.getElementById('teams') as HTMLInputElement).value = teams;
  };

  const loadAccessTokenToDOM = async () => {
    const accessToken = await settings.loadAccessToken();
    if (accessToken !== '') {
      (document.getElementById('access-token') as HTMLInputElement).value = displayedAccessToken;
    }
  };

  const loadIgnoredPrsToDOM = async () => {
    (document.getElementById('ignored-prs') as HTMLInputElement).value = await settings.loadIgnoredPrs();
  };

  const saveButtonClickHandler = async () => {
    storeCounterFromDOM();
    storeMaximumAgeFromDOM();
    storeScopeFromDOM();
    storeTeamsFromDOM();
    storeAccessTokenFromDom();
    storeIgnoredPrsFromDOM();
    alert('Your settings have been saved and your pull requests will be updated shortly!');
    await ServiceWorker().fetchAndStoreData();
  };

  const storeCounterFromDOM = () => {
    const counter: CounterConfig = {
      reviewRequested: (document.getElementById('review-requested') as HTMLInputElement).checked,
      teamReviewRequested: (document.getElementById('team-review-requested') as HTMLInputElement).checked,
      noReviewRequested: (document.getElementById('no-review-requested') as HTMLInputElement).checked,
      allReviewsDone: (document.getElementById('all-reviews-done') as HTMLInputElement).checked,
      missingAssignee: (document.getElementById('missing-assignee') as HTMLInputElement).checked,
      allAssigned: (document.getElementById('all-assigned') as HTMLInputElement).checked,
    };

    settings.storeCounterConfig(counter);
  };

  const storeMaximumAgeFromDOM = () => {
    const maximumAge = (document.getElementById('maximum-age') as HTMLInputElement).value;
    settings.storeMaximumAge(parseInt(maximumAge, 10));
  };

  const loadMaximumAgeFromDOM = async () => {
    const maximumAge = await settings.loadMaximumAge();
    (document.getElementById('maximum-age') as HTMLInputElement).value = maximumAge.toString();
  };

  const storeScopeFromDOM = () => {
    const scope = (document.getElementById('account-names') as HTMLInputElement).value;
    settings.storeScope(scope);
  };

  const storeTeamsFromDOM = () => {
    const teams = (document.getElementById('teams') as HTMLInputElement).value;
    settings.storeTeams(teams);
  };

  const storeAccessTokenFromDom = () => {
    const accessToken = (document.getElementById('access-token') as HTMLInputElement).value;
    if (accessToken !== displayedAccessToken) {
      settings.storeAccessToken(accessToken);
    }
  };

  const storeIgnoredPrsFromDOM = () => {
    const ignoredPrs = (document.getElementById('ignored-prs') as HTMLInputElement).value;
    settings.storeIgnoredPrs(ignoredPrs);
  };

  return { init, saveButtonClickHandler };
};

// TODO: Running this code in tests will cause ERR_UNHANDLED_REJECTION.
/* istanbul ignore next */
if (process.env.JEST_WORKER_ID === undefined) Options().init();

export default Options;
