/**
 * @typedef {Object} Issue
 * @property {number} id
 * @property {string|undefined} assignee
 * @property {string} title
 * @property {number} number
 * @property {number} created_at
 * @property {{url: string, html_url: string}} pull_request
 * @property {{login: string}} user
 */

/**
 * @typedef {Object} PullRequest
 * @property {number} id
 * @property {string|undefined} assignee
 * @property {string} title
 * @property {number} number
 * @property {string} ownerAndName
 * @property {number} createdAt
 * @property {number} ageInDays
 * @property {string} url
 * @property {string} repositoryUrl
 * @property {string} htmlUrl
 * @property {string} author
 */

/** @enum {string} */
export const PullRequestRecordKey = {
  reviewRequested: 'reviewRequested',
  teamReviewRequested: 'teamReviewRequested',
  noReviewRequested: 'noReviewRequested',
  allReviewsDone: 'allReviewsDone',
  missingAssignee: 'missingAssignee',
  allAssigned: 'allAssigned',
};

/**
 * @typedef {Object.<keyof typeof PullRequestRecordKey, PullRequest[]>} PullRequestRecord
 */

/**
 * @typedef {Object.<keyof typeof PullRequestRecordKey, boolean>} CounterConfig
 */

/**
 * @typedef {Pick<PullRequest, 'ownerAndName'|'number'>} IgnoredPr
 */

export default PullRequestRecordKey;
