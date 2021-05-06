import '../css/popup.scss';
import StorageSerilizer from './services/storage-serializer';
import { Issue } from './types/types';

const keys = [
  'reviewRequested',
  'noReviewRequested',
  'allReviewsDone',
  'missingAssignee',
];

export const popup = async() => {
  const doStuff = async() => {

    const data = await StorageSerilizer().loadPullRequests(keys);
    document.getElementById('content')!.appendChild(convertToHTML(data));
  };
  // await doStuff();
};

popup();

// TODO: remove any
const convertToHTML = (pullRequestObject: any) => {
  const container = document.createElement('div');
  for (const key in pullRequestObject) {
    const p = document.createElement('p');
    p.textContent = key;
    container.appendChild(p);
    container.appendChild(convertToOneHTML(pullRequestObject[key]));
  }
  return container;
};

const convertToOneHTML = (issues: Issue[]) => {
  const container = document.createElement('div');
  container.classList.add('group-container');
  for (let i = 0; i < issues.length; i++) {
    const smallContainer = document.createElement('div');
    const issue = issues[i];

    console.log(issue);
    const link = document.createElement('a');
    link.appendChild(document.createTextNode(issue.title));
    link.href = issue.pull_request.html_url;
    link.target = '_blank';
    smallContainer.appendChild(link);
    container.appendChild(smallContainer);
  }
  return container;
};
