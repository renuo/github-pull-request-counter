export interface Issue {
  id: number;
  assignee: string | undefined;
  title: string;
  number: number;
  created_at: string;
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
  createdAt: string;
  ageInDays: number;
  url: string;
  html_url: string;
}

export type PullRequestRecordKey = 'reviewRequested' | 'noReviewRequested' | 'allReviewsDone' | 'missingAssignee' | 'allAssigned';
export type PullRequestRecord = Record<PullRequestRecordKey, PullRequest[]>;

export type CounterConfig = Record<PullRequestRecordKey, boolean>;
