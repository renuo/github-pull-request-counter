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

type KeyType = typeof PullRequestRecordKey;
type KeyValue = KeyType[keyof KeyType];

export type PullRequestRecord = {
  [K in KeyValue]: PullRequest[];
};

export type CounterConfig = {
  [K in KeyValue]: boolean;
};
export type IgnoredPr = Pick<PullRequest, 'ownerAndName' | 'number'>;
