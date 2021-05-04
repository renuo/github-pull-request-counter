import githubApiWrapper, { GithubApiWrapper } from './github-api-wrapper';
import axios from 'axios';
import {
  mockListOfIssues,
  mockRequestedReviewers,
} from '../../../__test__/mocks/github-api-mock-data';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('githubApiWrapper', () => {
  let github: GithubApiWrapper;

  beforeAll(() => {
    github = githubApiWrapper({});
  });

  describe('#getReviewRequested', () => {
    let pullRequestCount: number;
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue(mockListOfIssues(pullRequestCount));
    })

    describe('with no pull requests', () => {
      beforeAll(() => {
        pullRequestCount = 0;
      })

      it('doesn\'t contain any links', async () => {
        const result = await github.getReviewRequested();
        expect(result.length).toEqual(0);
      });
    });

    describe('with a single pull request', () => {
      beforeAll(() => {
        pullRequestCount = 1;
      })

      it('has the correct link', async () => {
        const result = await github.getReviewRequested();
        expect(result.length).toEqual(1);
        expect(result[0]).toEqual('https://github.com/renuo/github-pull-request-counter/pull/1');
      });
    });

    describe('with three pull requests', () => {
      beforeAll(() => {
        pullRequestCount = 3;
      })

      it('has the correct links', async () => {
        const result = await github.getReviewRequested();
        expect(result.length).toEqual(3);
        expect(result[2]).toEqual('https://github.com/renuo/github-pull-request-counter/pull/3');
      });
    });
  });

  describe('#getNoReviewRequested', () => {
    let pullRequestCount: number;
    let openUserRequestCount = 0;
    let openTeamRequestCount = 0;

    beforeEach(() => {
      mockedAxios.get.mockImplementation((url: any) => {
        if (url.includes('/requested_reviewers')) {
          return Promise.resolve(mockRequestedReviewers(openUserRequestCount, openTeamRequestCount));
        } else {
          return Promise.resolve(mockListOfIssues(pullRequestCount));
        }
      });
    })

    describe('with no pull requests', () => {
      beforeAll(() => {
        pullRequestCount = 0;
      })

      it('doesn\'t contain any links', async () => {
        const result = await github.getNoReviewRequested();
        expect(result.length).toEqual(0);
      });
    });

    describe('with a single pull request', () => {
      beforeAll(() => {
        pullRequestCount = 1;
      })

      it('has the correct link', async () => {
        const result = await github.getNoReviewRequested();
        expect(result.length).toEqual(1);
        expect(result[0]).toEqual('https://github.com/renuo/github-pull-request-counter/pull/1');
      });
    });

    describe('with three pull requests', () => {
      beforeAll(() => {
        pullRequestCount = 3;
      })

      it('has the correct links', async () => {
        const result = await github.getNoReviewRequested();
        expect(result.length).toEqual(3);
        expect(result[2]).toEqual('https://github.com/renuo/github-pull-request-counter/pull/3');
      });

      describe('with a requested review from a user', () => {
        beforeAll(() => {
          openUserRequestCount = 1;
          openTeamRequestCount = 0;
        });

        it('doesn\'t contain any links', async () => {
          const result = await github.getNoReviewRequested();
          expect(result.length).toEqual(0);
        });
      })

      describe('with a requested review from a team', () => {
        beforeAll(() => {
          openUserRequestCount = 0;
          openTeamRequestCount = 1;
        });

        it('doesn\'t contain any links', async () => {
          const result = await github.getNoReviewRequested();
          expect(result.length).toEqual(0);
        });
      })
    });
  });

  describe('#getAllReviewsDone', () => {
    let pullRequestCount: number;
    let openUserRequestCount = 0;
    let openTeamRequestCount = 0;

    beforeEach(() => {
      mockedAxios.get.mockImplementation((url: any) => {
        if (url.includes('/requested_reviewers')) {
          return Promise.resolve(mockRequestedReviewers(openUserRequestCount, openTeamRequestCount));
        } else {
          return Promise.resolve(mockListOfIssues(pullRequestCount));
        }
      });
    })

    describe('with no pull requests', () => {
      beforeAll(() => {
        pullRequestCount = 0;
      })

      it('doesn\'t contain any links', async () => {
        const result = await github.getAllReviewsDone();
        expect(result.length).toEqual(0);
      });
    });

    describe('with a single pull request', () => {
      beforeAll(() => {
        pullRequestCount = 1;
      })

      it('has the correct link', async () => {
        const result = await github.getAllReviewsDone();
        expect(result.length).toEqual(1);
        expect(result[0]).toEqual('https://github.com/renuo/github-pull-request-counter/pull/1');
      });
    });

    describe('with three pull requests', () => {
      beforeAll(() => {
        pullRequestCount = 3;
      })

      it('has the correct links', async () => {
        const result = await github.getAllReviewsDone();
        expect(result.length).toEqual(3);
        expect(result[2]).toEqual('https://github.com/renuo/github-pull-request-counter/pull/3');
      });

      describe('with a requested review from a user', () => {
        beforeAll(() => {
          openUserRequestCount = 1;
          openTeamRequestCount = 0;
        });

        it('doesn\'t contain any links', async () => {
          const result = await github.getAllReviewsDone();
          expect(result.length).toEqual(0);
        });
      })

      describe('with a requested review from a team', () => {
        beforeAll(() => {
          openUserRequestCount = 0;
          openTeamRequestCount = 1;
        });

        it('doesn\'t contain any links', async () => {
          const result = await github.getAllReviewsDone();
          expect(result.length).toEqual(0);
        });
      })
    });
  });

  describe('#getMissingAssignee', () => {
    let pullRequestCount: number;
    let assignee: string | undefined;

    beforeEach(() => {
      mockedAxios.get.mockImplementation((url: any) => {
          return Promise.resolve(mockListOfIssues(pullRequestCount, { assignee }));
      });
    })

    describe('with no pull requests', () => {
      beforeAll(() => {
        pullRequestCount = 0;
        assignee = undefined;
      })

      it('doesn\'t contain any links', async () => {
        const result = await github.getMissingAssignee();
        expect(result.length).toEqual(0);
      });

      describe('with an assignee', () => {
        beforeAll(() => {
          assignee = 'Karl';
        });

        it('doesn\'t contain any links', async () => {
          const result = await github.getMissingAssignee();
          expect(result.length).toEqual(0);
        });
      });
    });

    describe('with a single pull request', () => {
      beforeAll(() => {
        pullRequestCount = 1;
        assignee = undefined;
      })

      it('has the correct link', async () => {
        const result = await github.getMissingAssignee();
        expect(result.length).toEqual(1);
        expect(result[0]).toEqual('https://github.com/renuo/github-pull-request-counter/pull/1');
      });

      describe('with an assignee', () => {
        beforeAll(() => {
          assignee = 'Karl';
        });

        it('doesn\'t contain any links', async () => {
          const result = await github.getMissingAssignee();
          expect(result.length).toEqual(0);
        });
      });
    });

    describe('with three pull requests', () => {
      beforeAll(() => {
        pullRequestCount = 3;
        assignee = undefined;
      })

      it('has the correct links', async () => {
        const result = await github.getMissingAssignee();
        expect(result.length).toEqual(3);
        expect(result[2]).toEqual('https://github.com/renuo/github-pull-request-counter/pull/3');
      });

      describe('with an assignee', () => {
        beforeAll(() => {
          assignee = 'Karl';
        });

        it('doesn\'t contain any links', async () => {
          const result = await github.getMissingAssignee();
          expect(result.length).toEqual(0);
        });
      });
    });
  });
});
