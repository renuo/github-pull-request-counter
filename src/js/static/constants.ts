export const recordKeys = [
  'reviewRequested',
  'noReviewRequested',
  'allReviewsDone',
  'missingAssignee',
];

export const recordKeysTranslations: {[key: string]: string} = {
  reviewRequested: 'I must review',
  noReviewRequested: 'Someone must review',
  allReviewsDone: 'All reviews done',
  missingAssignee: 'Missing Assignee',
};

export const extensionID = 'kiddjljoajjpciconkdenlbgecmbmafm';

export const noAccessTokenError = new Error('No Access Token');
export const tooManyRequestsError = new Error('Too many requests');
