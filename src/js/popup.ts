import '../css/popup.scss';
import StorageSerilizer from './services/storage-serializer';
import HTMLGenerator from './services/html-generator';

const keys = [
  'reviewRequested',
  'noReviewRequested',
  'allReviewsDone',
  'missingAssignee',
];

export const popup = async() => {
  const data = await StorageSerilizer().loadPullRequests(keys);
  const html = HTMLGenerator().generate(data);
  document.getElementById('content')!.appendChild(html);
};

popup();
