import githubApiWrapper, { GithubApiWrapper } from '../github-api-wrapper';
import axios from 'axios';
import {
  reviewerGetReviewRequestedMockData,
  assigneeGetNoReviewRequestedMockData,
  assigneeGetNoReviewRequestedMockDataRequestedReviewers,
} from '../../../__test__/mocks/github-api-mock-data';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('githubApiWrapper', () => {
  let github: GithubApiWrapper;

  beforeAll(() => {
    github = githubApiWrapper({});
  });

  describe('#reviewerGetReviewRequested', () => {
    let pullRequestCount: number;
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue(reviewerGetReviewRequestedMockData(pullRequestCount));
    })

    describe('with no pull requests', () => {
      beforeAll(() => {
        pullRequestCount = 0;
      })

      it('doesn\'t contain any links', async () => {
        const result = await github.reviewerGetReviewRequested();
        expect(result.length).toEqual(0);
      });
    });

    describe('with a single pull request', () => {
      beforeAll(() => {
        pullRequestCount = 1;
      })

      it('has the correct link', async () => {
        const result = await github.reviewerGetReviewRequested();
        expect(result.length).toEqual(1);
        expect(result[0]).toEqual('https://github.com/renuo/github-pull-request-counter/pull/1');
      });
    });

    describe('with three single pull requests', () => {
      beforeAll(() => {
        pullRequestCount = 3;
      })

      it('has the correct links', async () => {
        const result = await github.reviewerGetReviewRequested();
        expect(result.length).toEqual(3);
        expect(result[2]).toEqual('https://github.com/renuo/github-pull-request-counter/pull/3');
      });
    });
  });

  describe('#assigneeGetNoReviewRequested', () => {
    let pullRequestCount: number;

    beforeEach(() => {
      mockedAxios.get.mockImplementation((url: any) => {
        if (url.includes('/requested_reviewers')) {
          return Promise.resolve(assigneeGetNoReviewRequestedMockDataRequestedReviewers(-10, -10));
        } else {
          return Promise.resolve(assigneeGetNoReviewRequestedMockData(pullRequestCount));
        }
      });
    })

    describe('with no pull requests', () => {
      beforeAll(() => {
        pullRequestCount = 0;
      })

      it('doesn\'t contain any links', async () => {
        const result = await github.assigneeGetNoReviewRequested();
        expect(result.length).toEqual(0);
      });
    });

    describe('with a single pull request', () => {
      beforeAll(() => {
        pullRequestCount = 1;
      })

      it('has the correct link', async () => {
        const result = await github.assigneeGetNoReviewRequested();
        expect(result.length).toEqual(1);
        expect(result[0]).toEqual('https://github.com/renuo/github-pull-request-counter/pull/1');
      });
    });

    describe('with three single pull requests', () => {
      beforeAll(() => {
        pullRequestCount = 3;
      })

      it('has the correct links', async () => {
        const result = await github.assigneeGetNoReviewRequested();
        expect(result.length).toEqual(3);
        expect(result[2]).toEqual('https://github.com/renuo/github-pull-request-counter/pull/3');
      });
    });
  });
});
