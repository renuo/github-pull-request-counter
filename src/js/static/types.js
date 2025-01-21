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

/**
 * Constants for different types of pull request states
 * @type {Object.<string, string>}
 */
export const PullRequestRecordKey = {
  reviewRequested: 'reviewRequested',
  teamReviewRequested: 'teamReviewRequested',
  noReviewRequested: 'noReviewRequested',
  allReviewsDone: 'allReviewsDone',
  missingAssignee: 'missingAssignee',
  allAssigned: 'allAssigned',
};

/**
 * @typedef {Object.<string, PullRequest[]>} PullRequestRecord
 * @description Record mapping pull request states to arrays of pull requests
 */

/**
 * @typedef {Object.<string, boolean>} CounterConfig
 * @description Configuration for which pull request states to count
 */

/**
 * @typedef {Object} IgnoredPr
 * @property {string} ownerAndName - Repository owner and name
 * @property {number} number - Pull request number
 */

export default PullRequestRecordKey;
