export interface PullRequest {
  id: number;
  assignee: string | undefined;
  title: string;
  number: number;
  owner: string;
  pull_request: {
    url: string,
    html_url: string
  };
}

export type PullRequestRecordKey = 'reviewRequested' | 'noReviewRequested' | 'allReviewsDone' | 'missingAssignee';
export type PullRequestRecord = Record<PullRequestRecordKey, PullRequest[]>;

export interface Counter {
  [key: string]: boolean;
}

