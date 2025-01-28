export const PullRequestRecordKey = {
  reviewRequested: 'reviewRequested',
  teamReviewRequested: 'teamReviewRequested',
  noReviewRequested: 'noReviewRequested',
  allReviewsDone: 'allReviewsDone',
  missingAssignee: 'missingAssignee',
  allAssigned: 'allAssigned',
};

export const recordKeysTranslations = {
  [PullRequestRecordKey.reviewRequested]: 'I must review',
  [PullRequestRecordKey.teamReviewRequested]: 'My team must review',
  [PullRequestRecordKey.noReviewRequested]: 'No review requested',
  [PullRequestRecordKey.allReviewsDone]: 'All reviews done',
  [PullRequestRecordKey.missingAssignee]: 'Missing Assignee',
  [PullRequestRecordKey.allAssigned]: 'Assigned to me',
};

export const extensionID = 'bibndenbofpgbojggadiaigfogibenak';

export const noAccessTokenError = new Error('No Access Token');
export const tooManyRequestsError = new Error('Too many requests');

export const displayedAccessToken = 'ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
