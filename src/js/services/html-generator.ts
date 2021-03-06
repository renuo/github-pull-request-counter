import { CounterConfig, PullRequest, PullRequestRecord, PullRequestRecordKey } from '../static/types';
import { recordKeysTranslations, extensionID } from '../static/constants';

const HTMLGenerator = () => {
  const generate = (record: PullRequestRecord, counter: CounterConfig): HTMLDivElement => {
    const topLevelDiv = document.createElement('div');
    topLevelDiv.classList.add('pull-requests-loaded');

    for (const key of Object.keys(record)) {
      if (record[key as PullRequestRecordKey].length === 0) continue;
      const lessRelevant = !counter[key as PullRequestRecordKey];

      const titleP = document.createElement('p');
      titleP.textContent = recordKeysTranslations[key];
      titleP.classList.add('title');
      if (lessRelevant) titleP.classList.add('less-relevant-group');
      topLevelDiv.appendChild(titleP);

      topLevelDiv.appendChild(generateLinkStructure(record[key as PullRequestRecordKey], lessRelevant));
    }

    if (topLevelDiv.children.length === 0) {
      const titleP = document.createElement('p');
      titleP.textContent = 'Nothing to do';
      titleP.classList.add('title');
      topLevelDiv.classList.remove('pull-requests-loaded');
      topLevelDiv.appendChild(titleP);
      topLevelDiv.appendChild(generateNoContent());
    }

    return topLevelDiv;
  };

  const generateLinkStructure = (pullRequests: PullRequest[], lessRelevant: boolean): HTMLDivElement => {
    const groupLevelDiv = document.createElement('div');
    groupLevelDiv.classList.add('group-container');
    if (lessRelevant) groupLevelDiv.classList.add('less-relevant-group');

    for (const PullRequest of pullRequests) {
      const pullRequestDiv = document.createElement('div');

      pullRequestDiv.appendChild(generateLink(PullRequest));
      pullRequestDiv.appendChild(generateSubDescription(PullRequest));

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
    const link = `<a href="chrome-extension://${extensionID}/options.html" target="_blank" class="link-in-text">options&nbsp;</a>`;
    p2.innerHTML = `Or you configured the extension wrong. Have a look the ${link}  to verify your configuration.`;
    noContentDiv.appendChild(p1);
    noContentDiv.appendChild(p2);
    return noContentDiv;
  };

  const generateLink = (PullRequest: PullRequest) => {
    const link = document.createElement('a');
    link.appendChild(document.createTextNode(PullRequest.title));
    link.href = PullRequest.html_url;
    link.target = '_blank';
    return link;
  };

  const generateSubDescription = (PullRequest: PullRequest) => {
    const subDescriptionP = document.createElement('p');
    subDescriptionP.textContent = PullRequest.ownerAndName;
    subDescriptionP.classList.add('subdescription');
    const numberB = document.createElement('b');
    numberB.textContent = ` #${PullRequest.number}`;
    subDescriptionP.appendChild(numberB);
    subDescriptionP.appendChild(document.createTextNode(` (${Math.floor(PullRequest.ageInDays)} days ago)`));
    return subDescriptionP;
  };

  return { generate };
};

export default HTMLGenerator;
