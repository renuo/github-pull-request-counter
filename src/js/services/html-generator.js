import { recordKeysTranslations, extensionID } from '../static/constants.js';

const HTMLGenerator = () => {

  const generate = (record, counter) => {
    const topLevelDiv = document.createElement('div');
    topLevelDiv.classList.add('pull-requests-loaded');

    for (const key of Object.keys(record)) {
      if (record[key].length === 0) continue;
      const lessRelevant = !counter[key];

      const titleP = document.createElement('h5');
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


  const generateLinkStructure = (pullRequests, lessRelevant) => {
    const groupLevelDiv = document.createElement('div');
    groupLevelDiv.classList.add('group-container');
    if (lessRelevant) groupLevelDiv.classList.add('less-relevant-group');

    for (const PullRequest of pullRequests) {
      const container = document.createElement('div');
      container.classList.add('link-container');

      const wrapper = document.createElement('div');
      const link = document.createElement('a');
      link.innerHTML = PullRequest.title;
      link.href = PullRequest.htmlUrl;
      link.target = '_blank';
      link.classList.add('pr-link');
      wrapper.appendChild(link);
      container.appendChild(wrapper);

      const subdescription = document.createElement('p');
      subdescription.classList.add('subdescription');
      subdescription.innerHTML = `${PullRequest.ownerAndName}<b> #${PullRequest.number}</b> (${Math.floor(PullRequest.ageInDays)} days ago)`;
      container.appendChild(subdescription);

      groupLevelDiv.appendChild(container);
    }

    return groupLevelDiv;
  };


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


  // Helper functions removed as they're now inlined in generateLinkStructure

  return { generate };
};

export default HTMLGenerator;
