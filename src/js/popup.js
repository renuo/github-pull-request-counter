import PullRequestStorageAccessor from './services/pull-request-storage-accessor.js';
import HTMLGenerator from './services/html-generator.js';
import SettingsStorageAccessor from './services/settings-storage-accessor.js';

const Popup = async () => {
  const pullRequests = await PullRequestStorageAccessor().loadPullRequests();
  const counter = await SettingsStorageAccessor().loadCounterConfig();
  const html = HTMLGenerator().generate(pullRequests, counter);
  const popupElement = document.getElementById('popup');
  if (popupElement) {
    popupElement.appendChild(html);
  }
};

export default Popup;

Popup();
