import '../css/colors.css';
import '../css/shared.css';
import '../css/popup.css';
import PullRequestStorageAccessor from './services/pull-request-storage-accessor.js';
import HTMLGenerator from './services/html-generator';
import SettingsStorageAccessor from './services/settings-storage-accessor';

const Popup = async () => {
  const pullRequests = await PullRequestStorageAccessor().loadPullRequests();
  const counter = await SettingsStorageAccessor().loadCounterConfig();
  const html = HTMLGenerator().generate(pullRequests, counter);
  document.getElementById('popup')!.appendChild(html);
};

// TODO: Running this code in tests will cause ERR_UNHANDLED_REJECTION.
/* istanbul ignore next */
if (process.env.JEST_WORKER_ID === undefined) Popup();

export default Popup;
