export interface Issue {
  id: number;
  assignee: string | undefined;
  title: string;
  number: number;
  owner: string;
  user: {
    login: string,
  };
  pull_request: {
    url: string,
    html_url: string
  };
}

export interface PullRequestRecord {
  [key: string]: Issue[];
}

