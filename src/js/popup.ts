import '../css/popup.scss';
import StorageSerilizer from './services/storage-serializer';
import HTMLGenerator from './services/html-generator';
import { recordKeys } from './static/constants';

export const popup = async() => {
  const data = await StorageSerilizer().loadPullRequests(recordKeys);
  const html = HTMLGenerator().generate(data);
  document.getElementById('popup')!.appendChild(html);
};

popup();
