import { IgnoredPr, PullRequest } from './types';

export declare function containsPullRequest(pullRequests: Partial<PullRequest>[], target: IgnoredPr): boolean;
export declare function parsePullRequest(element: string): IgnoredPr;
