export const recordKeys = [
  'reviewRequested',
  'noReviewRequested',
  'allReviewsDone',
  'missingAssignee',
  'allAssigned',
];

export const recordKeysTranslations: { [key: string]: string } = {
  reviewRequested: 'I must review',
  noReviewRequested: 'No review requested',
  allReviewsDone: 'All reviews done',
  missingAssignee: 'Missing Assignee',
  allAssigned: 'Assigned to me',
};

export const extensionID = 'eeejbcmnmgogpkgeinlbchoafjjbegmi';

export const noAccessTokenError = new Error('No Access Token');
export const tooManyRequestsError = new Error('Too many requests');

export const displayedAccessToken = 'ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
