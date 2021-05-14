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

export interface PullRequestRecord {
  [key: string]: PullRequest[];
}

export interface Counter {
  [key: string]: boolean;
}

