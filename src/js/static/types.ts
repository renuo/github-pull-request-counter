export interface Issue {
  id: number;
  assignee: string | undefined;
  title: string;
  number: number;
  pull_request: {
    url: string,
    html_url: string,
  };
}

export interface PullRequest {
  id: number;
  assignee: string | undefined;
  title: string;
  number: number;
  ownerAndName: string;
  url: string;
  html_url: string;
}

export type PullRequestRecordKey = 'reviewRequested' | 'noReviewRequested' | 'allReviewsDone' | 'missingAssignee';
export type PullRequestRecord = Record<PullRequestRecordKey, PullRequest[]>;

export type CounterConfig = Record<PullRequestRecordKey, boolean>;
