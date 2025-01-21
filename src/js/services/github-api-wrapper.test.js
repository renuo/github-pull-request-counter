import GithubApiWrapper from './github-api-wrapper.js';
import { mockListOfPullRequests, mockRequestedReviewers } from '../../../__test__/mocks/github-api-mock-data.js';
import fetch from 'node-fetch';
import MockDate from 'mockdate';

jest.mock('node-fetch');
const mockedFetch = /** @type {any} */ (fetch);

global.fetch = mockedFetch;
global.btoa = (/** @type {string} */ data) => Buffer.from(data).toString('base64');
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
    },
  },
};

describe('GithubApiWrapper', () => {
  let scope = '';

  beforeEach(() => {
    global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({
      'scope': scope,
      'accessToken': 'secret',
    }));
  });

  describe('#getReviewRequested', () => {
    /** @type {number} */
    let pullRequestCount;
    beforeEach(() => {
      mockedFetch.mockResolvedValue(Promise.resolve({
        json: () => Promise.resolve(mockListOfPullRequests(pullRequestCount)),
      }));
    });

    describe('with no pull requests', () => {
      beforeAll(() => pullRequestCount = 0);

      it('doesn\'t contain any links', async () => {
        const result = await (await GithubApiWrapper()).getReviewRequested();
        expect(result.length).toEqual(0);
      });
    });

    describe('with a single pull request', () => {
      beforeAll(() => pullRequestCount = 1);

      it('has the correct link', async () => {
        const result = await (await GithubApiWrapper()).getReviewRequested();
        expect(result.length).toEqual(1);
        expect(result[0].htmlUrl).toEqual('https://github.com/renuo/github-pull-request-counter/pull/1');
      });
    });

    describe('with three pull requests', () => {
      beforeAll(() => pullRequestCount = 3);

      it('has the correct links', async () => {
        const result = await (await GithubApiWrapper()).getReviewRequested();
        expect(result.length).toEqual(3);
        expect(result[2].htmlUrl).toEqual('https://github.com/renuo/github-pull-request-counter/pull/3');
      });
    });

    describe('ownerAndName', () => {
      it('has the correct ownerAndName', async () => {
        const result = await (await GithubApiWrapper()).getReviewRequested();
        expect(result[0].ownerAndName).toEqual('renuo/github-pull-request-counter');
      });
    });

    describe('the pull requests being from teams', () => {
      beforeEach(() => {
        global.chrome.storage.local.get = jest.fn().mockImplementation((/** @type {string} */ _keys, /** @type {(items: any) => void} */ callback) => callback({
          'teams': 'myTeam, myOtherTeam', 'accessToken': 'secret',
        }));
      });

      it('has no pull requests', async () => {
        const result = await (await GithubApiWrapper()).getReviewRequested();
        expect(result.length).toEqual(0);
      });
    });
  });

  describe('#getTeamReviewRequested', () => {
    /** @type {number} */
    let teamPullRequestCount;
    beforeEach(() => {
      mockedFetch.mockResolvedValue(Promise.resolve({
        json: () => Promise.resolve(mockListOfPullRequests(teamPullRequestCount)),
      }));
      global.chrome.storage.local.get = jest.fn().mockImplementation((/** @type {string} */ _keys, /** @type {(items: any) => void} */ callback) => callback({
        'teams': 'myTeam', 'accessToken': 'secret',
      }));
    });

    describe('with no pull requests', () => {
      beforeAll(() => teamPullRequestCount = 0);

      it('doesn\'t contain any links', async () => {
        const result = await (await GithubApiWrapper()).getTeamReviewRequested();
        expect(result.length).toEqual(0);
      });
    });

    describe('with a single pull request', () => {
      beforeAll(() => teamPullRequestCount = 1);

      it('has the correct link', async () => {
        const result = await (await GithubApiWrapper()).getTeamReviewRequested();
        expect(result.length).toEqual(1);
        expect(result[0].htmlUrl).toEqual('https://github.com/renuo/github-pull-request-counter/pull/1');
      });
    });

    describe('with an error', () => {
      beforeEach(() => {
        mockedFetch.mockResolvedValue(Promise.resolve({
          json: () => Promise.resolve({ errors: ['Something went wrong'] }),
        }));
      });

      it('doesn\'t contain any links', async () => {
        const result = await (await GithubApiWrapper()).getTeamReviewRequested();
        expect(result.length).toEqual(0);
      });
    });
  });

  describe('#getNoReviewRequested', () => {
    /** @type {number} */
    let pullRequestCount;
    let openUserRequestCount = 0;
    let openTeamRequestCount = 0;

    beforeEach(() => {
      mockedFetch.mockImplementation((url: string) => {
        const value = url.includes('/requested_reviewers') ?
          mockRequestedReviewers(openUserRequestCount, openTeamRequestCount) :
          mockListOfPullRequests(pullRequestCount);

        return Promise.resolve({
          json: () => Promise.resolve(value),
        });
      });
    });

    describe('with no pull requests', () => {
      beforeAll(() => pullRequestCount = 0);

      it('doesn\'t contain any links', async () => {
        const result = await (await GithubApiWrapper()).getNoReviewRequested();
        expect(result.length).toEqual(0);
      });
    });

    describe('with a single pull request', () => {
      beforeAll(() => pullRequestCount = 1);

      it('has the correct link', async () => {
        const result = await (await GithubApiWrapper()).getNoReviewRequested();
        expect(result.length).toEqual(1);
        expect(result[0].htmlUrl).toEqual('https://github.com/renuo/github-pull-request-counter/pull/1');
      });
    });

    describe('with three pull requests', () => {
      beforeAll(() => pullRequestCount = 3);

      it('has the correct links', async () => {
        const result = await (await GithubApiWrapper()).getNoReviewRequested();
        expect(result.length).toEqual(3);
        expect(result[2].htmlUrl).toEqual('https://github.com/renuo/github-pull-request-counter/pull/3');
      });

      describe('with a requested review from a user', () => {

        beforeAll(() => openUserRequestCount = 1);
        afterAll(() => openUserRequestCount = 0);

        it('doesn\'t contain any links', async () => {
          const result = await (await GithubApiWrapper()).getNoReviewRequested();
          expect(result.length).toEqual(0);
        });
      });

      describe('with a requested review from a team', () => {
        beforeAll(() => openTeamRequestCount = 1);
        afterAll(() => openTeamRequestCount = 0);

        it('doesn\'t contain any links', async () => {
          const result = await (await GithubApiWrapper()).getNoReviewRequested();
          expect(result.length).toEqual(0);
        });
      });

      describe('with matching scope', () => {
        beforeAll(() => { scope = 'renuo'; });
        afterAll(() => { scope = ''; });

        it('contains three links', async () => {
          expect((await (await GithubApiWrapper()).getNoReviewRequested()).length).toEqual(3);
        });
      });

      describe('with a not matching scope', () => {
        beforeAll(() => scope = 'notMatchingScope');

        afterAll(() => {
          scope = '';
        });

        it('doesn\'t contain any links', async () => {
          expect((await (await GithubApiWrapper()).getNoReviewRequested()).length).toEqual(0);
        });
      });

      describe('edge-cases', () => {
        describe('renuo,renuo', () => {
          beforeAll(() => { scope = 'renuo,renuo'; });
          afterAll(() => { scope = ''; });

          it('contains three links', async () => {
            expect((await (await GithubApiWrapper()).getNoReviewRequested()).length).toEqual(3);
          });
        });

        describe('renuo,notMatchingScope', () => {
          beforeAll(() => { scope = 'renuo,notMatchingScope'; });
          afterAll(() => { scope = ''; });

          it('doesn\'t contain any links', async () => {
            expect((await (await GithubApiWrapper()).getNoReviewRequested()).length).toEqual(3);
          });
        });

        describe(',renuo', () => {
          beforeAll(() => { scope = ',renuo'; });
          afterAll(() => { scope = ''; });

          it('contains three links', async () => {
            expect((await (await GithubApiWrapper()).getNoReviewRequested()).length).toEqual(3);
          });
        });

        describe('renuo,', () => {
          beforeAll(() => { scope = ',renuo'; });
          afterAll(() => { scope = ''; });

          it('contains three links', async () => {
            expect((await (await GithubApiWrapper()).getNoReviewRequested()).length).toEqual(3);
          });
        });
      });
    });
  });

  describe('#getAllReviewsDone', () => {
    /** @type {number} */
    let pullRequestCount;
    let openUserRequestCount = 0;
    let openTeamRequestCount = 0;

    beforeEach(() => {
      mockedFetch.mockImplementation((url: string) => {
        const value = url.includes('/requested_reviewers') ?
          mockRequestedReviewers(openUserRequestCount, openTeamRequestCount) :
          mockListOfPullRequests(pullRequestCount);

        return Promise.resolve({
          json: () => Promise.resolve(value),
        });
      });
    });

    describe('with no pull requests', () => {
      beforeAll(() => pullRequestCount = 0);

      it('doesn\'t contain any links', async () => {
        const result = await (await GithubApiWrapper()).getAllReviewsDone();
        expect(result.length).toEqual(0);
      });
    });

    describe('with a single pull request', () => {
      beforeAll(() => pullRequestCount = 1);

      it('has the correct link', async () => {
        const result = await (await GithubApiWrapper()).getAllReviewsDone();
        expect(result.length).toEqual(1);
        expect(result[0].htmlUrl).toEqual('https://github.com/renuo/github-pull-request-counter/pull/1');
      });
    });

    describe('with three pull requests', () => {
      beforeAll(() => pullRequestCount = 3);

      it('has the correct links', async () => {
        const result = await (await GithubApiWrapper()).getAllReviewsDone();
        expect(result.length).toEqual(3);
        expect(result[2].htmlUrl).toEqual('https://github.com/renuo/github-pull-request-counter/pull/3');
      });

      describe('with a requested review from a user', () => {
        beforeAll(() => openUserRequestCount = 1);
        afterAll(() => openUserRequestCount = 0);

        it('doesn\'t contain any links', async () => {
          const result = await (await GithubApiWrapper()).getAllReviewsDone();
          expect(result.length).toEqual(0);
        });
      });

      describe('with a requested review from a team', () => {
        beforeAll(() => openTeamRequestCount = 1);
        afterAll(() => openTeamRequestCount = 0);

        it('doesn\'t contain any links', async () => {
          const result = await (await GithubApiWrapper()).getAllReviewsDone();
          expect(result.length).toEqual(0);
        });
      });
    });
  });

  describe('#getMissingAssignee', () => {
    let pullRequestCount: number = 0;
    let assignee: string | undefined;

    beforeEach(() => {
      mockedFetch.mockResolvedValue(Promise.resolve({
        json: () => Promise.resolve(mockListOfPullRequests(pullRequestCount, { assignee, created_at: undefined })),
      }));
    });

    describe('with no pull requests', () => {
      it('doesn\'t contain any links', async () => {
        const result = await (await GithubApiWrapper()).getMissingAssignee();
        expect(result.length).toEqual(0);
      });

      describe('with an assignee', () => {
        beforeAll(() => assignee = 'Karl');
        afterAll(() => assignee = undefined);

        it('doesn\'t contain any links', async () => {
          const result = await (await GithubApiWrapper()).getMissingAssignee();
          expect(result.length).toEqual(0);
        });
      });
    });

    describe('with a single pull request', () => {
      beforeAll(() => pullRequestCount = 1);

      it('has the correct link', async () => {
        const result = await (await GithubApiWrapper()).getMissingAssignee();
        expect(result.length).toEqual(1);
        expect(result[0].htmlUrl).toEqual('https://github.com/renuo/github-pull-request-counter/pull/1');
      });

      describe('with an assignee', () => {
        beforeAll(() => assignee = 'Karl');
        afterAll(() => assignee = undefined);

        it('doesn\'t contain any links', async () => {
          const result = await (await GithubApiWrapper()).getMissingAssignee();
          expect(result.length).toEqual(0);
        });
      });
    });

    describe('with three pull requests', () => {
      beforeAll(() => pullRequestCount = 3);

      it('has the correct links', async () => {
        const result = await (await GithubApiWrapper()).getMissingAssignee();
        expect(result.length).toEqual(3);
        expect(result[2].htmlUrl).toEqual('https://github.com/renuo/github-pull-request-counter/pull/3');
      });

      describe('with an assignee', () => {
        beforeAll(() => assignee = 'Karl');
        afterAll(() => assignee = undefined);

        it('doesn\'t contain any links', async () => {
          const result = await (await GithubApiWrapper()).getMissingAssignee();
          expect(result.length).toEqual(0);
        });
      });
    });
  });

  describe('#getAllAssigned', () => {
    let pullRequestCount: number;
    beforeEach(() => {
      mockedFetch.mockResolvedValue(Promise.resolve({
        json: () => Promise.resolve(mockListOfPullRequests(pullRequestCount)),
      }));
    });

    describe('with no pull requests', () => {
      beforeAll(() => pullRequestCount = 0);

      it('doesn\'t contain any links', async () => {
        const result = await (await GithubApiWrapper()).getAllAssigned();
        expect(result.length).toEqual(0);
      });
    });

    describe('with a single pull request', () => {
      beforeAll(() => pullRequestCount = 1);

      it('has the correct link', async () => {
        const result = await (await GithubApiWrapper()).getAllAssigned();
        expect(result.length).toEqual(1);
        expect(result[0].htmlUrl).toEqual('https://github.com/renuo/github-pull-request-counter/pull/1');
      });
    });

    describe('with three pull requests', () => {
      beforeAll(() => pullRequestCount = 3);

      it('has the correct links', async () => {
        const result = await (await GithubApiWrapper()).getAllAssigned();
        expect(result.length).toEqual(3);
        expect(result[2].htmlUrl).toEqual('https://github.com/renuo/github-pull-request-counter/pull/3');
      });
    });

    describe('filterByMaximumAge', () => {
      const pullRequest1 = mockListOfPullRequests(1, { assignee: undefined, created_at: Date.parse('2021-05-20T14:17:00Z') });
      const pullRequest2 = mockListOfPullRequests(1, { assignee: undefined, created_at: Date.parse('2021-06-25T14:17:00Z') });
      const pullRequest3 = mockListOfPullRequests(1, { assignee: undefined, created_at: Date.parse('2021-04-15T14:17:00Z') });

      beforeEach(() => {
        mockedFetch.mockResolvedValue(Promise.resolve({
          json: () => Promise.resolve({ total_count: 3, items: [...pullRequest1.items, ...pullRequest2.items, ...pullRequest3.items] }),
        }));
      });

      beforeEach(() => MockDate.set('2021-07-08'));
      afterEach(() => MockDate.reset());

      it('has the correct order (newest first)', async () => {
        const result = await (await GithubApiWrapper()).getAllAssigned();

        expect(result[0].createdAt).toEqual(Date.parse('2021-06-25T14:17:00Z'));
        expect(result[1].createdAt).toEqual(Date.parse('2021-05-20T14:17:00Z'));
        expect(result[2].createdAt).toEqual(Date.parse('2021-04-15T14:17:00Z'));
      });

      describe('with a maximum age of 10 days', () => {
        beforeEach(() => {
          global.chrome.storage.local.get = jest.fn().mockImplementation((/** @type {string} */ _keys, /** @type {(items: any) => void} */ callback) => callback({
            'scope': scope, 'accessToken': 'secret', 'maximumAge': '10',
          }));
        });

        it('reduces the ammount to 0', async () => {
          expect((await (await GithubApiWrapper()).getAllAssigned()).length).toEqual(0);
        });
      });

      describe('with a maximum age of 20 days', () => {
        beforeEach(() => {
          global.chrome.storage.local.get = jest.fn().mockImplementation((/** @type {string} */ _keys, /** @type {(items: any) => void} */ callback) => callback({
            'scope': scope, 'accessToken': 'secret', 'maximumAge': '20',
          }));
        });

        it('reduces the ammount to 1', async () => {
          expect((await (await GithubApiWrapper()).getAllAssigned()).length).toEqual(1);
        });
      });

      describe('with a maximum age of 2 months', () => {
        beforeEach(() => {
          global.chrome.storage.local.get = jest.fn().mockImplementation((/** @type {string} */ _keys, /** @type {(items: any) => void} */ callback) => callback({
            'scope': scope, 'accessToken': 'secret', 'maximumAge': '60',
          }));
        });

        it('reduces the ammount to 2', async () => {
          expect((await (await GithubApiWrapper()).getAllAssigned()).length).toEqual(2);
        });
      });

      describe('with a maximum age of 1 year', () => {
        beforeEach(() => {
          global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({
            'scope': scope, 'accessToken': 'secret', 'maximumAge': '365',
          }));
        });

        it('still has all pull requests', async () => {
          expect((await (await GithubApiWrapper()).getAllAssigned()).length).toEqual(3);
        });
      });
    });
  });

  describe('Too many requests', () => {
    beforeEach(() => {
      mockedFetch.mockResolvedValue(Promise.resolve({
        status: 403,
      }));
    });

    it('throws', async () => {
      await expect(GithubApiWrapper()).rejects.toThrow('Too many requests');
    });
  });

  describe('With no access token', () => {
    beforeEach(() => {
      global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({ 'scope': scope }));
    });

    it('throws', async () => {
      await expect(GithubApiWrapper()).rejects.toThrow('No Access Token');
    });
  });
});
