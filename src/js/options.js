import '../css/colors.css';
import '../css/shared.css';
import '../css/options.css';
import SettingsStorageAccessor from './services/settings-storage-accessor';
import ServiceWorker from './background.js';
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
    document.getElementById('options-save').addEventListener('click', saveButtonClickHandler);
  };

  const loadCounterToDOM = async () => {
    const counter = await settings.loadCounterConfig();
    document.getElementById('review-requested').checked = counter.reviewRequested;
    document.getElementById('team-review-requested').checked = counter.teamReviewRequested;
    document.getElementById('no-review-requested').checked = counter.noReviewRequested;
    document.getElementById('all-reviews-done').checked = counter.allReviewsDone;
    document.getElementById('missing-assignee').checked = counter.missingAssignee;
    document.getElementById('all-assigned').checked = counter.allAssigned;
  };

  const loadScopeToDOM = async () => {
    const scope = await settings.loadScope();
    document.getElementById('account-names').value = scope;
  };

  const loadTeamsToDOM = async () => {
    const teams = await settings.loadTeams();
    document.getElementById('teams').value = teams;
  };

  const loadAccessTokenToDOM = async () => {
    const accessToken = await settings.loadAccessToken();
    if (accessToken !== '') {
      document.getElementById('access-token').value = displayedAccessToken;
    }
  };

  const loadIgnoredPrsToDOM = async () => {
    document.getElementById('ignored-prs').value = await settings.loadIgnoredPrs();
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
    const counter = {
      reviewRequested: document.getElementById('review-requested').checked,
      teamReviewRequested: document.getElementById('team-review-requested').checked,
      noReviewRequested: document.getElementById('no-review-requested').checked,
      allReviewsDone: document.getElementById('all-reviews-done').checked,
      missingAssignee: document.getElementById('missing-assignee').checked,
      allAssigned: document.getElementById('all-assigned').checked,
    };

    settings.storeCounterConfig(counter);
  };

  const storeMaximumAgeFromDOM = () => {
    const maximumAge = document.getElementById('maximum-age').value;
    settings.storeMaximumAge(parseInt(maximumAge, 10));
  };

  const loadMaximumAgeFromDOM = async () => {
    const maximumAge = await settings.loadMaximumAge();
    document.getElementById('maximum-age').value = maximumAge.toString();
  };

  const storeScopeFromDOM = () => {
    const scope = document.getElementById('account-names').value;
    settings.storeScope(scope);
  };

  const storeTeamsFromDOM = () => {
    const teams = document.getElementById('teams').value;
    settings.storeTeams(teams);
  };

  const storeAccessTokenFromDom = () => {
    const accessToken = document.getElementById('access-token').value;
    if (accessToken !== displayedAccessToken) {
      settings.storeAccessToken(accessToken);
    }
  };

  const storeIgnoredPrsFromDOM = () => {
    const ignoredPrs = document.getElementById('ignored-prs').value;
    settings.storeIgnoredPrs(ignoredPrs);
  };

  return { init, saveButtonClickHandler };
};

// TODO: Running this code in tests will cause ERR_UNHANDLED_REJECTION.
/* istanbul ignore next */
if (process.env.JEST_WORKER_ID === undefined) Options().init();

export default Options;
