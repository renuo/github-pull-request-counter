import { recordKeysTranslations, extensionID, PullRequestRecordKey } from '../static/constants.js';

const HTMLGenerator = () => {
  const generate = (record, counter) => {
    const topLevelDiv = document.createElement('div');
    topLevelDiv.classList.add('pull-requests-loaded');

    for (const key of Object.keys(PullRequestRecordKey)) {
      const recordKey = PullRequestRecordKey[key];
      if (!record[recordKey] || record[recordKey].length === 0) continue;
      const lessRelevant = !counter[recordKey];

      const titleP = document.createElement('h5');
      titleP.textContent = recordKeysTranslations[recordKey];
      titleP.classList.add('title');
      if (lessRelevant) titleP.classList.add('less-relevant-group');
      topLevelDiv.appendChild(titleP);

      topLevelDiv.appendChild(generateLinkStructure(record[recordKey], lessRelevant, recordKey));
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

  const generateStatusBadge = (category) => {
    const badge = document.createElement('span');
    badge.classList.add('pr-status-badge');

    let text = '';
    switch(category) {
      case PullRequestRecordKey.reviewRequested:
        text = 'Review Requested';
        badge.classList.add('status-review');
        break;
      case PullRequestRecordKey.teamReviewRequested:
        text = 'Team Review';
        badge.classList.add('status-team-review');
        break;
      case PullRequestRecordKey.noReviewRequested:
        text = 'No Review';
        badge.classList.add('status-no-review');
        break;
      case PullRequestRecordKey.allReviewsDone:
        text = 'Reviews Done';
        badge.classList.add('status-done');
        break;
      case PullRequestRecordKey.missingAssignee:
        text = 'Needs Assignee';
        badge.classList.add('status-missing');
        break;
      case PullRequestRecordKey.allAssigned:
        text = 'Assigned';
        badge.classList.add('status-assigned');
        break;
    }
    badge.appendChild(document.createTextNode(text));
    return badge;
  };

  const generateLinkStructure = (pullRequests, lessRelevant, category) => {
    const groupLevelDiv = document.createElement('div');
    groupLevelDiv.classList.add('group-container');
    if (lessRelevant) groupLevelDiv.classList.add('less-relevant-group');

    for (const PullRequest of pullRequests) {
      const container = document.createElement('div');
      container.classList.add('link-container');
      if (lessRelevant) container.classList.add('less-relevant-group');

      const link = generatePullRequestLink(PullRequest);
      container.appendChild(link);

      const subdescription = generateSubDescription(PullRequest);
      if (category) {
        subdescription.insertBefore(generateStatusBadge(category), subdescription.firstChild);
      }
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

  const generatePullRequestLink = (PullRequest) => {
    const link = document.createElement('a');
    link.classList.add('pr-link');
    link.appendChild(document.createTextNode(PullRequest.title));
    link.href = PullRequest.htmlUrl;
    link.target = '_blank';
    return link;
  };

  const formatTimeAgo = (ageInDays) => {
    if (ageInDays < 1) return 'today';
    if (ageInDays < 2) return 'yesterday';
    if (ageInDays < 30) return `${Math.floor(ageInDays)} days ago`;
    const months = Math.floor(ageInDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  };

  const generateAssigneeInfo = (assignee) => {
    if (!assignee) return null;
    const span = document.createElement('span');
    span.classList.add('pr-assignee');
    span.appendChild(document.createTextNode(` • Assigned to ${assignee}`));
    return span;
  };

  const generateSubDescription = (PullRequest) => {
    const subDescriptionP = document.createElement('p');
    subDescriptionP.classList.add('subdescription');

    const repoText = `${PullRequest.ownerAndName} #${PullRequest.number}`;
    subDescriptionP.appendChild(document.createTextNode(repoText));

    const timeText = formatTimeAgo(PullRequest.ageInDays);
    const authorText = ` • opened ${timeText} by ${PullRequest.author}`;
    subDescriptionP.appendChild(document.createTextNode(authorText));

    const assigneeInfo = generateAssigneeInfo(PullRequest.assignee);
    if (assigneeInfo) {
      subDescriptionP.appendChild(assigneeInfo);
    }

    return subDescriptionP;
  };

  return { generate };
};

export default HTMLGenerator;
