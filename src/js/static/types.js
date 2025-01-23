export const Issue = {
  id: 0,
  assignee: undefined,
  title: '',
  number: 0,
  created_at: 0,
  pull_request: {
    url: '',
    html_url: '',
  },
  user: {
    login: '',
  },
};

export const PullRequest = {
  id: 0,
  assignee: undefined,
  title: '',
  number: 0,
  ownerAndName: '',
  createdAt: 0,
  ageInDays: 0,
  url: '',
  repositoryUrl: '',
  htmlUrl: '',
  author: '',
};

import { PullRequestRecordKey } from './constants.js';

export const PullRequestRecord = {
  [PullRequestRecordKey.reviewRequested]: [],
  [PullRequestRecordKey.teamReviewRequested]: [],
  [PullRequestRecordKey.noReviewRequested]: [],
  [PullRequestRecordKey.allReviewsDone]: [],
  [PullRequestRecordKey.missingAssignee]: [],
  [PullRequestRecordKey.allAssigned]: [],
};

export const CounterConfig = {
  [PullRequestRecordKey.reviewRequested]: true,
  [PullRequestRecordKey.teamReviewRequested]: true,
  [PullRequestRecordKey.noReviewRequested]: true,
  [PullRequestRecordKey.allReviewsDone]: true,
  [PullRequestRecordKey.missingAssignee]: true,
  [PullRequestRecordKey.allAssigned]: false,
};

export const IgnoredPr = {
  ownerAndName: '',
  number: 0,
};
