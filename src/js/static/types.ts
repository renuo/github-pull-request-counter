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

export type PullRequestRecord = Record<PullRequestRecordKey, PullRequest[]>;
export enum PullRequestRecordKey {
  reviewRequested = 'reviewRequested',
  teamReviewRequested = 'teamReviewRequested',
  noReviewRequested = 'noReviewRequested',
  allReviewsDone = 'allReviewsDone',
  missingAssignee = 'missingAssignee',
  allAssigned = 'allAssigned',
}

export type CounterConfig = Record<PullRequestRecordKey, boolean>;
export type IgnoredPr = Pick<PullRequest, 'ownerAndName' | 'number'>;
