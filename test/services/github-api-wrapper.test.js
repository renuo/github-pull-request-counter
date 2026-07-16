import GithubApiWrapper from '../../src/js/services/github-api-wrapper.js';
import { mockPullRequestNodes, mockGraphqlResponse } from '../mocks/github-api-mock-data.js';
import fetch from 'node-fetch';
import MockDate from 'mockdate';

jest.mock('node-fetch');
const mockedFetch = fetch;

global.fetch = mockedFetch;
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
    },
  },
};

// Every call to `fetch` (the constructor's `viewer` query and the main query)
// resolves to the same GraphQL response.
const respondWith = (response) => {
  mockedFetch.mockResolvedValue(Promise.resolve({
    status: 200,
    json: () => Promise.resolve(response),
  }));
};

describe('GithubApiWrapper', () => {
  let scope = '';

  beforeEach(() => {
    global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback) => callback({
      'scope': scope,
      'accessToken': 'secret',
    }));
  });

  describe('#getReviewRequested', () => {
    let pullRequestCount;
    beforeEach(() => respondWith(mockGraphqlResponse(mockPullRequestNodes(pullRequestCount))));

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
        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback) => callback({
          'teams': 'myTeam, myOtherTeam', 'accessToken': 'secret',
        }));
        // The same three PRs are returned for both the personal review-requested
        // search and the team searches, so all of them are filtered out.
        const nodes = mockPullRequestNodes(3);
        respondWith(mockGraphqlResponse(nodes, { team0: nodes, team1: nodes }));
      });

      it('has no pull requests', async () => {
        const result = await (await GithubApiWrapper()).getReviewRequested();
        expect(result.length).toEqual(0);
      });
    });
  });

  describe('#getTeamReviewRequested', () => {
    let teamPullRequestCount;
    beforeEach(() => {
      global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback) => callback({
        'teams': 'myTeam', 'accessToken': 'secret',
      }));
      const nodes = mockPullRequestNodes(teamPullRequestCount);
      respondWith(mockGraphqlResponse(nodes, { team0: nodes }));
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

    describe('with no configured teams', () => {
      beforeEach(() => {
        global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback) => callback({
          'accessToken': 'secret',
        }));
        respondWith(mockGraphqlResponse(mockPullRequestNodes(3)));
      });

      it('doesn\'t contain any links', async () => {
        const result = await (await GithubApiWrapper()).getTeamReviewRequested();
        expect(result.length).toEqual(0);
      });
    });
  });

  describe('#getNoReviewRequested', () => {
    let pullRequestCount;
    let reviewRequests = 0;

    beforeEach(() => respondWith(mockGraphqlResponse(mockPullRequestNodes(pullRequestCount, { reviewRequests }))));

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

      describe('with an open review request', () => {
        beforeAll(() => reviewRequests = 1);
        afterAll(() => reviewRequests = 0);

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
        afterAll(() => { scope = ''; });

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

          it('contains three links', async () => {
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
      });
    });
  });

  describe('#getAllReviewsDone', () => {
    let pullRequestCount;
    let reviewRequests = 0;

    beforeEach(() => respondWith(mockGraphqlResponse(mockPullRequestNodes(pullRequestCount, { reviewRequests }))));

    describe('with no pull requests', () => {
      beforeAll(() => pullRequestCount = 0);

      it('doesn\'t contain any links', async () => {
        const result = await (await GithubApiWrapper()).getAllReviewsDone();
        expect(result.length).toEqual(0);
      });
    });

    describe('with three pull requests', () => {
      beforeAll(() => pullRequestCount = 3);

      it('has the correct links', async () => {
        const result = await (await GithubApiWrapper()).getAllReviewsDone();
        expect(result.length).toEqual(3);
        expect(result[2].htmlUrl).toEqual('https://github.com/renuo/github-pull-request-counter/pull/3');
      });

      describe('with an open review request', () => {
        beforeAll(() => reviewRequests = 1);
        afterAll(() => reviewRequests = 0);

        it('doesn\'t contain any links', async () => {
          const result = await (await GithubApiWrapper()).getAllReviewsDone();
          expect(result.length).toEqual(0);
        });
      });
    });
  });

  describe('#getMissingAssignee', () => {
    let pullRequestCount = 0;
    let assignees = 0;

    beforeEach(() => respondWith(mockGraphqlResponse(mockPullRequestNodes(pullRequestCount, { assignees }))));

    describe('with no pull requests', () => {
      beforeAll(() => pullRequestCount = 0);

      it('doesn\'t contain any links', async () => {
        const result = await (await GithubApiWrapper()).getMissingAssignee();
        expect(result.length).toEqual(0);
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
        beforeAll(() => assignees = 1);
        afterAll(() => assignees = 0);

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
        beforeAll(() => assignees = 1);
        afterAll(() => assignees = 0);

        it('doesn\'t contain any links', async () => {
          const result = await (await GithubApiWrapper()).getMissingAssignee();
          expect(result.length).toEqual(0);
        });
      });
    });
  });

  describe('#getAllAssigned', () => {
    let pullRequestCount;
    beforeEach(() => respondWith(mockGraphqlResponse(mockPullRequestNodes(pullRequestCount))));

    describe('with no pull requests', () => {
      beforeAll(() => pullRequestCount = 0);

      it('doesn\'t contain any links', async () => {
        const result = await (await GithubApiWrapper()).getAllAssigned();
        expect(result.length).toEqual(0);
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
      const pr1 = mockPullRequestNodes(1, { createdAt: '2021-05-20T14:17:00Z' });
      const pr2 = mockPullRequestNodes(1, { createdAt: '2021-06-25T14:17:00Z' });
      const pr3 = mockPullRequestNodes(1, { createdAt: '2021-04-15T14:17:00Z' });
      const nodes = [...pr1, ...pr2, ...pr3];

      beforeEach(() => respondWith(mockGraphqlResponse(nodes)));

      beforeEach(() => MockDate.set('2021-07-08'));
      afterEach(() => MockDate.reset());

      it('has the correct order (newest first)', async () => {
        const result = await (await GithubApiWrapper()).getAllAssigned();

        expect(new Date(result[0].createdAt).getTime()).toEqual(Date.parse('2021-06-25T14:17:00Z'));
        expect(new Date(result[1].createdAt).getTime()).toEqual(Date.parse('2021-05-20T14:17:00Z'));
        expect(new Date(result[2].createdAt).getTime()).toEqual(Date.parse('2021-04-15T14:17:00Z'));
      });

      describe('with a maximum age of 10 days', () => {
        beforeEach(() => {
          global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback) => callback({
            'scope': scope, 'accessToken': 'secret', 'maximumAge': '10',
          }));
        });

        it('reduces the ammount to 0', async () => {
          expect((await (await GithubApiWrapper()).getAllAssigned()).length).toEqual(0);
        });
      });

      describe('with a maximum age of 20 days', () => {
        beforeEach(() => {
          global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback) => callback({
            'scope': scope, 'accessToken': 'secret', 'maximumAge': '20',
          }));
        });

        it('reduces the ammount to 1', async () => {
          expect((await (await GithubApiWrapper()).getAllAssigned()).length).toEqual(1);
        });
      });

      describe('with a maximum age of 2 months', () => {
        beforeEach(() => {
          global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback) => callback({
            'scope': scope, 'accessToken': 'secret', 'maximumAge': '60',
          }));
        });

        it('reduces the ammount to 2', async () => {
          expect((await (await GithubApiWrapper()).getAllAssigned()).length).toEqual(2);
        });
      });

      describe('with a maximum age of 1 year', () => {
        beforeEach(() => {
          global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback) => callback({
            'scope': scope, 'accessToken': 'secret', 'maximumAge': '365',
          }));
        });

        it('still has all pull requests', async () => {
          expect((await (await GithubApiWrapper()).getAllAssigned()).length).toEqual(3);
        });
      });
    });
  });

  describe('#getAll', () => {
    beforeEach(() => respondWith(mockGraphqlResponse(mockPullRequestNodes(3))));

    it('resolves every category from a single request', async () => {
      mockedFetch.mockClear();
      const record = await (await GithubApiWrapper()).getAll();

      expect(record.reviewRequested.length).toEqual(3);
      expect(record.allAssigned.length).toEqual(3);
      // One request for the `viewer` login lookup, one for the batched query.
      expect(mockedFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Too many requests', () => {
    beforeEach(() => {
      mockedFetch.mockResolvedValue(Promise.resolve({
        status: 403,
        json: () => Promise.resolve({}),
      }));
    });

    it('throws', async () => {
      await expect(GithubApiWrapper()).rejects.toThrow('Too many requests');
    });
  });

  describe('With a GraphQL rate-limit error', () => {
    beforeEach(() => {
      mockedFetch.mockResolvedValue(Promise.resolve({
        status: 200,
        json: () => Promise.resolve({ errors: [{ type: 'RATE_LIMITED', message: 'API rate limit exceeded' }] }),
      }));
    });

    it('throws', async () => {
      await expect(GithubApiWrapper()).rejects.toThrow('Too many requests');
    });
  });

  describe('With no access token', () => {
    beforeEach(() => {
      global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback) => callback({ 'scope': scope }));
    });

    it('throws', async () => {
      await expect(GithubApiWrapper()).rejects.toThrow('No Access Token');
    });
  });
});
