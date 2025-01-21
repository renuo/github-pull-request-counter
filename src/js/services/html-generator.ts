import { PullRequestRecordKey } from '../static/types.js';
import { recordKeysTranslations, extensionID } from '../static/constants';

const HTMLGenerator = () => {
  /**
   * @param {Object.<string, Array>} record - Record of pull requests
   * @param {Object.<string, boolean>} counter - Counter configuration
   * @returns {HTMLDivElement} Generated HTML element
   */
  /** @type {(record: Object.<string, Array>, counter: Object.<string, boolean>) => HTMLDivElement} */
  const generate = (record, counter) => {
    const topLevelDiv = document.createElement('div');
    topLevelDiv.classList.add('pull-requests-loaded');

    for (const key of Object.keys(record)) {
      if (record[key].length === 0) continue;
      const lessRelevant = !counter[key];

      const titleP = document.createElement('h5');
      // @ts-ignore
      titleP.textContent = recordKeysTranslations[key];
      titleP.classList.add('title');
      if (lessRelevant) titleP.classList.add('less-relevant-group');
      topLevelDiv.appendChild(titleP);

      topLevelDiv.appendChild(generateLinkStructure(record[key], lessRelevant));
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

  /**
   * @param {Array} pullRequests - Array of pull request objects
   * @param {boolean} lessRelevant - Whether the group is less relevant
   * @returns {HTMLDivElement} Generated HTML element
   */
  /** @type {(pullRequests: Array, lessRelevant: boolean) => HTMLDivElement} */
  const generateLinkStructure = (pullRequests, lessRelevant) => {
    const groupLevelDiv = document.createElement('div');
    groupLevelDiv.classList.add('group-container');
    if (lessRelevant) groupLevelDiv.classList.add('less-relevant-group');

    for (const PullRequest of pullRequests) {
      const pullRequestDiv = document.createElement('div');
      pullRequestDiv.classList.add('link-container');

      const firstRow = document.createElement('div');
      const secondRow = document.createElement('div');
      pullRequestDiv.appendChild(firstRow);
      pullRequestDiv.appendChild(secondRow);

      const repoUrl = document.createElement('a');
      repoUrl.appendChild(document.createTextNode(PullRequest.ownerAndName));
      repoUrl.classList.add('repo-link');
      repoUrl.href = PullRequest.repositoryUrl;

      repoUrl.target = '_blank';
      firstRow.appendChild(repoUrl);

      firstRow.appendChild(generatePullRequestLink(PullRequest));
      secondRow.appendChild(generateSubDescription(PullRequest));

      groupLevelDiv.appendChild(pullRequestDiv);
    }

    return groupLevelDiv;
  };

  /** @returns {HTMLDivElement} */
  const generateNoContent = () => {
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

  /**
   * @param {Object} PullRequest - Pull request object
   * @returns {HTMLAnchorElement} Generated link element
   */
  /** @type {(PullRequest: Object) => HTMLAnchorElement} */
  const generatePullRequestLink = (PullRequest) => {
    const link = document.createElement('a');
    link.classList.add('pr-link');
    link.appendChild(document.createTextNode(PullRequest.title));
    link.href = PullRequest.htmlUrl;
    link.target = '_blank';
    return link;
  };

  /**
   * @param {Object} PullRequest - Pull request object
   * @returns {HTMLParagraphElement} Generated description element
   */
  /** @type {(PullRequest: Object) => HTMLParagraphElement} */
  const generateSubDescription = (PullRequest) => {
    const subDescriptionP = document.createElement('p');
    subDescriptionP.classList.add('subdescription');
    subDescriptionP.appendChild(document.createTextNode(`#${PullRequest.number} opened ${Math.floor(PullRequest.ageInDays)} days ago by ${PullRequest.author}`));
    return subDescriptionP;
  };

  return { generate };
};

export default HTMLGenerator;
