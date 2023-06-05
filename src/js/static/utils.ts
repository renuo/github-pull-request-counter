import { IgnoredPr, PullRequest } from './types';

export const containsPullRequest = (pullRequests: Partial<PullRequest>[], target: IgnoredPr) => {
    return pullRequests.some(pr => pr.ownerAndName === target.ownerAndName && pr.number === target.number);
};

export const parsePullRequest = (element: string): IgnoredPr => {
    const [ownerAndName, prNumber] = element.split('#');
    return {
        ownerAndName,
        number: parseInt(prNumber, 10),
    };
};