export interface Issue {
  id: number;
  assignee: string | undefined;
  title: string;
  number: number;
  created_at: number;
  pull_request: {
    url: string,
    html_url: string,
  };
  user: {
    login: string;
  };
}

export interface PullRequest {
  id: number;
  assignee: string | undefined;
  title: string;
  number: number;
  ownerAndName: string;
  createdAt: number;
  ageInDays: number;
  url: string;
  repositoryUrl: string;
  htmlUrl: string;
  author: string;
}

import { PullRequestRecordKey } from './constants';

export type PullRequestRecord = {
  reviewRequested: PullRequest[];
  teamReviewRequested: PullRequest[];
  noReviewRequested: PullRequest[];
  allReviewsDone: PullRequest[];
  missingAssignee: PullRequest[];
  allAssigned: PullRequest[];
};
export type CounterConfig = {
  reviewRequested: boolean;
  teamReviewRequested: boolean;
  noReviewRequested: boolean;
  allReviewsDone: boolean;
  missingAssignee: boolean;
  allAssigned: boolean;
};
export type IgnoredPr = Pick<PullRequest, 'ownerAndName' | 'number'>;
