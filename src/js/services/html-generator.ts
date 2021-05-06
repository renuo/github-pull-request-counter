import { Issue, PullRequestRecord } from '../types/types';

const HTMLGenerator = () => {
  const generate = (record: PullRequestRecord) => {
    const container = document.createElement('div');
    for (const key in record) {
      const p = document.createElement('p');
      p.textContent = key;
      container.appendChild(p);
      container.appendChild(convertToOneHTML(record[key]));
    }
    return container;
  }

  const convertToOneHTML = (issues: Issue[]) => {
    const container = document.createElement('div');
    container.classList.add('group-container');
    for (let i = 0; i < issues.length; i++) {
      const smallContainer = document.createElement('div');
      const issue = issues[i];

      const link = document.createElement('a');
      link.appendChild(document.createTextNode(issue.title));
      link.href = issue.pull_request.html_url;
      link.target = '_blank';
      smallContainer.appendChild(link);
      container.appendChild(smallContainer);
    }
    return container;
  };

  return { generate }
}

export default HTMLGenerator;
