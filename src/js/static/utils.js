/**
 * @typedef {import('./types.js').PullRequest} PullRequest
 * @typedef {Pick<PullRequest, 'ownerAndName'|'number'>} IgnoredPr
 */

/** @type {function(Array<Partial<PullRequest>>, IgnoredPr): boolean} */
export const containsPullRequest = (pullRequests, target) => {
    return pullRequests.some(pr => pr.ownerAndName === target.ownerAndName && pr.number === target.number);
};

/** @type {function(string): IgnoredPr} */
export const parsePullRequest = (element) => {
    const [ownerAndName, prNumber] = element.split('#');
    return {
        ownerAndName,
        number: parseInt(prNumber, 10),
    };
};
