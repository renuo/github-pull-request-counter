import GithubApiWrapper from './github-api-wrapper';
import { mockListOfPullRequests, mockRequestedReviewers } from '../../../__test__/mocks/github-api-mock-data';
import fetch from 'node-fetch';

jest.mock('node-fetch');
const mockedFetch = fetch as any;

global.fetch = mockedFetch;
global.btoa = (data: string) => Buffer.from(data).toString('base64');
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
    },
  },
} as any;

describe('GithubApiWrapper', () => {
  let scope = '';

  beforeEach(async () => {
    global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({
      'scope': scope ,
      'accessToken': 'secret',
    }));
  });

  describe('#getReviewRequested', () => {
    let pullRequestCount: number;
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
        expect(result[0].html_url).toEqual('https://github.com/renuo/github-pull-request-counter/pull/1');
      });
    });

    describe('with three pull requests', () => {
      beforeAll(() => pullRequestCount = 3);

      it('has the correct links', async () => {
        const result = await (await GithubApiWrapper()).getReviewRequested();
        expect(result.length).toEqual(3);
        expect(result[2].html_url).toEqual('https://github.com/renuo/github-pull-request-counter/pull/3');
      });
    });
  });

  describe('#getNoReviewRequested', () => {
    let pullRequestCount: number;
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
        expect(result[0].html_url).toEqual('https://github.com/renuo/github-pull-request-counter/pull/1');
      });
    });

    describe('with three pull requests', () => {
      beforeAll(() => pullRequestCount = 3);

      it('has the correct links', async () => {
        const result = await (await GithubApiWrapper()).getNoReviewRequested();
        expect(result.length).toEqual(3);
        expect(result[2].html_url).toEqual('https://github.com/renuo/github-pull-request-counter/pull/3');
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
    let pullRequestCount: number;
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
        expect(result[0].html_url).toEqual('https://github.com/renuo/github-pull-request-counter/pull/1');
      });
    });

    describe('with three pull requests', () => {
      beforeAll(() => pullRequestCount = 3);

      it('has the correct links', async () => {
        const result = await (await GithubApiWrapper()).getAllReviewsDone();
        expect(result.length).toEqual(3);
        expect(result[2].html_url).toEqual('https://github.com/renuo/github-pull-request-counter/pull/3');
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
        json: () => Promise.resolve(mockListOfPullRequests(pullRequestCount, { assignee })),
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
        expect(result[0].html_url).toEqual('https://github.com/renuo/github-pull-request-counter/pull/1');
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
        expect(result[2].html_url).toEqual('https://github.com/renuo/github-pull-request-counter/pull/3');
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

  describe('Too many requests', () => {
    beforeEach(() => {
      mockedFetch.mockResolvedValue(Promise.resolve({
        status: 403,
      }));
    });

    it('throws', async () =>  {
      await expect(GithubApiWrapper()).rejects.toThrow('Too many requests');
    });
  });

  describe('With no access token', () => {
    beforeEach(() => {
      global.chrome.storage.local.get = jest.fn().mockImplementation((_keys, callback: (items: {}) => {}) => callback({ 'scope': scope }));
    });

    it('throws', async () =>  {
      await expect(GithubApiWrapper()).rejects.toThrow('No Access Token');
    });
  });
});
