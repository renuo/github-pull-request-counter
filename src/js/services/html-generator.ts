import { Issue, PullRequestRecord } from '../static/types';
import { recordKeysTranslations } from '../static/constants';

const HTMLGenerator = () => {
  const generate = (record: PullRequestRecord): HTMLDivElement => {
    const topLevelDiv = document.createElement('div');
    topLevelDiv.classList.add('pull-requests-loaded')

    for (const key of Object.keys(record)) {
      if (record[key].length === 0) continue;

      const titleP = document.createElement('p');
      titleP.textContent = recordKeysTranslations[key] || 'Unknown';
      titleP.classList.add('title');
      topLevelDiv.appendChild(titleP);

      topLevelDiv.appendChild(generateLinkStructure(record[key]));
    }

    if (topLevelDiv.children.length === 0) {
      const titleP = document.createElement('p');
      titleP.textContent = 'Nothing to do';
      titleP.classList.add('title');
      topLevelDiv.appendChild(titleP);
      topLevelDiv.appendChild(generateNoContent());
    }

    return topLevelDiv;
  };

  const generateLinkStructure = (issues: Issue[]): HTMLDivElement => {
    const groupLevelDiv = document.createElement('div');
    groupLevelDiv.classList.add('group-container');

    for (const issue of issues) {
      const pullRequestDiv = document.createElement('div');

      pullRequestDiv.appendChild(generateLink(issue));
      pullRequestDiv.appendChild(generateSubDescription(issue));

      pullRequestDiv.classList.add('link-container');
      groupLevelDiv.appendChild(pullRequestDiv);
    }

    return groupLevelDiv;
  };

  const generateNoContent = (): HTMLDivElement => {
    const noContentDiv = document.createElement('div');
    noContentDiv.classList.add('group-container');
    const p1 = document.createElement('p');
    const p2 = document.createElement('p');
    p1.textContent = 'Seems like you are a good coworker :)';
    p2.textContent = 'In the meantime you could recommend the extention to your friends or rate it in the Store.';
    noContentDiv.appendChild(p1);
    noContentDiv.appendChild(p2);
    return noContentDiv;
  };

  const generateLink = (issue: Issue) => {
    const link = document.createElement('a');
    link.appendChild(document.createTextNode(issue.title));
    link.href = issue.pull_request.html_url;
    link.target = '_blank';
    return link;
  };

  const generateSubDescription = (issue: Issue) => {
    const subDescriptionP = document.createElement('p');
    subDescriptionP.textContent = `${issue.owner} #${issue.number}`;
    return subDescriptionP;
  };

  return { generate };
};

export default HTMLGenerator;
