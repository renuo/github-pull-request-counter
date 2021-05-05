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

    let data = await StorageSerilizer().loadPullRequests(keys);
    document.getElementById('content')!.appendChild(convertToHTML(data));
  }
  await doStuff();

  const healthButton = document.getElementById('health-check');
  if (healthButton) {
    healthButton.addEventListener('click', () => {
      alert('All good');
    });
  }

  const testExample = () => {
    return 5;
  };

  return { testExample };
};


popup();

// TODO: remove any
const convertToHTML = (pullRequestObject: any) => {
  let container = document.createElement('div');
  for (let key in pullRequestObject) {
    let p = document.createElement('p');
    p.textContent = key;
    container.appendChild(p);
    container.appendChild(convertToOneHTML(pullRequestObject[key]));
  }
  return container;
}

const convertToOneHTML = (issues: Issue[]) => {
  let container = document.createElement('div');
  container.classList.add('group-container');
  for (let i = 0; i < issues.length; i++) {
    let smallContainer = document.createElement('div');
    let issue = issues[i];

    console.log(issue);
    let link = document.createElement('a');
    link.appendChild(document.createTextNode(issue.title));
    link.href = issue.pull_request.html_url;
    link.target = "_blank";
    smallContainer.appendChild(link);
    container.appendChild(smallContainer);
  }
  return container;
}
