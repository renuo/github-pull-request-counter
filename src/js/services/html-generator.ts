import { Issue, PullRequestRecord } from '../types/types';

const HTMLGenerator = () => {
  const generate = (record: PullRequestRecord): HTMLDivElement => {
    const topLevelDiv = document.createElement('div');

    for (const key of Object.keys(record)) {
      const titleP = document.createElement('p');
      titleP.textContent = key;
      topLevelDiv.appendChild(titleP);

      topLevelDiv.appendChild(generateLinkStructure(record[key]));
    }

    return topLevelDiv;
  };

  const generateLinkStructure = (issues: Issue[]): HTMLDivElement => {
    const groupLevelDiv = document.createElement('div');
    groupLevelDiv.classList.add('group-container');

    for (const issue of issues) {
      const linkContainerDiv = document.createElement('div');
      linkContainerDiv.appendChild(generateLink(issue));
      groupLevelDiv.appendChild(linkContainerDiv);
    }

    return groupLevelDiv;
  };

  const generateLink = (issue: Issue) => {
    const link = document.createElement('a');
    link.appendChild(document.createTextNode(issue.title));
    link.href = issue.pull_request.html_url;
    link.target = '_blank';
    return link;
  };

  return { generate };
};

export default HTMLGenerator;
