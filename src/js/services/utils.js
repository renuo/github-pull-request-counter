export const containsPullRequest = (pullRequests, target) => {
    return pullRequests.some(pr => pr.ownerAndName === target.ownerAndName && pr.number === target.number);
};

export const parsePullRequest = (element) => {
    const [ownerAndName, prNumber] = element.split('#');
    return {
        ownerAndName,
        number: parseInt(prNumber, 10),
    };
};

export const isTest = () => {
    return (typeof process !== 'undefined') && (process.env.JEST_WORKER_ID !== undefined);
}
