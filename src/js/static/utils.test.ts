import { containsPullRequest, parsePullRequest } from './utils.js';
import { PullRequest } from './types';

describe('utils', () => {
    describe('containsPullRequest', () => {
        describe('with multiple PRs', () => {
            const prs = [{ ownerAndName: 'owner/repo', number: 12 }];

            it('checks whether the PR exists', () => {
                expect(containsPullRequest(prs, { ownerAndName: 'owner/repo', number: 12 })).toBe(true);
                expect(containsPullRequest(prs, { ownerAndName: 'owner/repo', number: -1 })).toBe(false);
            });
        });

        describe('with no PRs', () => {
            const prs: Partial<PullRequest>[] = [];

            it('checks whether the PR exists', () => {
                expect(containsPullRequest(prs, { ownerAndName: 'owner/repo', number: 12 })).toBe(false);
            });
        });
    });

    describe('parsePullRequest', () => {
        it('parses the PR correctly', () => {
            expect(parsePullRequest('owner/repo#12')).toEqual({ number: 12, ownerAndName: 'owner/repo' });
        });
    });
});
