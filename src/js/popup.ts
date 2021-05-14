import '../css/popup.scss';
import StorageSerilizer from './services/storage-serializer';
import HTMLGenerator from './services/html-generator';
import { recordKeys } from './static/constants';

const Popup = async () => {
  const data = await StorageSerilizer().loadPullRequests(recordKeys);
  const html = HTMLGenerator().generate(data);
  document.getElementById('popup')!.appendChild(html);
};

// TODO: Running this code in tests will cause ERR_UNHANDLED_REJECTION.
/* istanbul ignore next */
if (process.env.JEST_WORKER_ID === undefined) Popup();

export default Popup;
