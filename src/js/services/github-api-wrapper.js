import { noAccessTokenError, tooManyRequestsError } from './constants.js';
import SettingsStorageAccessor from './settings-storage-accessor.js';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

// Fields requested for every pull request. `reviewRequests` and `assignees`
// carry the counts that used to require one REST `/requested_reviewers` call
// per pull request, so the whole poll is now a single GraphQL request.
const PULL_REQUEST_FIELDS = `
  number
  title
  url
  createdAt
  isDraft
  author { login }
  assignees(first: 1) { totalCount }
  reviewRequests(first: 1) { totalCount }
  repository { nameWithOwner url }
`;

const GithubApiWrapper = async () => {
  // Builds one aliased `search` field. GitHub search qualifiers are identical
  // to the ones the REST implementation used.
  const searchField = (alias, queryString) => `
    ${alias}: search(query: ${JSON.stringify(queryString)}, type: ISSUE, first: 100) {
      nodes { ... on PullRequest { ${PULL_REQUEST_FIELDS} } }
    }`;

  const buildQuery = (teams) => {
    const fields = [
      'viewer { login }',
      searchField('reviewRequested', `is:open is:pr review-requested:${userName} archived:false`),
      searchField('noReviewRequested', `is:open is:pr assignee:${userName} archived:false review:none`),
      searchField('allReviewsDone', `is:open is:pr assignee:${userName} archived:false -review:none`),
      searchField('missingAssignee', `is:open is:pr author:${userName} draft:false archived:false`),
      searchField('allAssigned', `is:open is:pr assignee:${userName} archived:false`),
      ...teams.map((team, index) => (
        searchField(`team${index}`, `is:open is:pr team-review-requested:${team} archived:false`)
      )),
    ];

    return `query {${fields.join('\n')}}`;
  };

  const teamNames = async () => {
    const teams = await SettingsStorageAccessor().loadTeams();
    if (teams === '') return [];
    return teams.replace(/ /g, '').split(',').filter((team) => team !== '');
  };

  // A single network round-trip that resolves every category at once.
  const fetchAll = async () => {
    const teams = await teamNames();
    const data = await graphqlRequest(buildQuery(teams));

    const teamPullRequests = teams.flatMap((_team, index) => nodesOf(data, `team${index}`));

    return {
      reviewRequested: nodesOf(data, 'reviewRequested'),
      teamPullRequests,
      noReviewRequested: nodesOf(data, 'noReviewRequested'),
      allReviewsDone: nodesOf(data, 'allReviewsDone'),
      missingAssignee: nodesOf(data, 'missingAssignee'),
      allAssigned: nodesOf(data, 'allAssigned'),
    };
  };

  const nodesOf = (data, alias) => (data[alias] && data[alias].nodes) || [];

  const getReviewRequested = async () => {
    const { reviewRequested, teamPullRequests } = await fetchAll();
    const processed = await processNodes(reviewRequested, false);

    const teamUrls = (await processNodes(teamPullRequests, false)).map((pr) => pr.url);
    return processed.filter((pr) => !teamUrls.includes(pr.url));
  };

  const getTeamReviewRequested = async () => {
    const { teamPullRequests } = await fetchAll();
    return processNodes(teamPullRequests, false);
  };

  // A pull request assigned to me still counts as "no review requested" only
  // when nobody (user or team) has been requested for review.
  const getNoReviewRequested = async () => {
    const { noReviewRequested } = await fetchAll();
    return processNodes(noReviewRequested.filter(hasNoReviewRequest));
  };

  const getAllReviewsDone = async () => {
    const { allReviewsDone } = await fetchAll();
    return processNodes(allReviewsDone.filter(hasNoReviewRequest));
  };

  const getMissingAssignee = async () => {
    const { missingAssignee } = await fetchAll();
    return processNodes(missingAssignee.filter((node) => node.assignees.totalCount === 0));
  };

  const getAllAssigned = async () => {
    const { allAssigned } = await fetchAll();
    return processNodes(allAssigned);
  };

  // Resolves all six categories from a single GraphQL round-trip. This is what
  // the service worker calls every poll; the individual getters above exist for
  // callers that need one category in isolation.
  const getAll = async () => {
    const raw = await fetchAll();

    const teamReviewRequested = await processNodes(raw.teamPullRequests, false);
    const teamUrls = teamReviewRequested.map((pr) => pr.url);

    return {
      reviewRequested: (await processNodes(raw.reviewRequested, false)).filter((pr) => !teamUrls.includes(pr.url)),
      teamReviewRequested,
      noReviewRequested: await processNodes(raw.noReviewRequested.filter(hasNoReviewRequest)),
      allReviewsDone: await processNodes(raw.allReviewsDone.filter(hasNoReviewRequest)),
      missingAssignee: await processNodes(raw.missingAssignee.filter((node) => node.assignees.totalCount === 0)),
      allAssigned: await processNodes(raw.allAssigned),
    };
  };

  const hasNoReviewRequest = (node) => node.reviewRequests.totalCount === 0;

  const graphqlRequest = async (query) => {
    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (response.status === 403 || response.status === 429) throw tooManyRequestsError;

    const body = await response.json();
    if (isRateLimited(body)) throw tooManyRequestsError;

    return body.data || {};
  };

  const isRateLimited = (body) => (
    Array.isArray(body.errors) && body.errors.some((error) => error.type === 'RATE_LIMITED')
  );

  const processNodes = async (nodes, shouldFilterByMaximumAge = true) => {
    const filtered = await filterByScope(nodes);
    const pullRequests = filtered.map((node) => ({
      id: 12,
      assignee: undefined,
      title: node.title,
      number: node.number,
      ownerAndName: node.repository.nameWithOwner,
      createdAt: node.createdAt,
      ageInDays: getDifferenceInDays(new Date(node.createdAt)),
      url: node.url,
      repositoryUrl: node.repository.url,
      htmlUrl: node.url,
      author: node.author ? node.author.login : undefined,
      ignored: false,
    }));

    const sorted = sortByDate(pullRequests);
    return shouldFilterByMaximumAge ? filterByMaximumAge(sorted) : sorted;
  };

  const filterByScope = async (nodes) => {
    const scope = await SettingsStorageAccessor().loadScope();
    if (scope === '') return nodes;

    const individualScopes = (scope).replace(' ', '').toLowerCase().split(',');
    return nodes.filter((node) => (
      individualScopes.includes(node.repository.nameWithOwner.split('/')[0].toLowerCase())
    ));
  };

  const sortByDate = (pullRequests) =>
    pullRequests.sort((pullRequest1, pullRequest2) => (
      new Date(pullRequest2.createdAt).getTime() - new Date(pullRequest1.createdAt).getTime()
    ));

  const filterByMaximumAge = async (pullRequests) => {
    const maximumAge = await SettingsStorageAccessor().loadMaximumAge();

    return pullRequests.filter((pullRequest) => pullRequest.ageInDays < maximumAge);
  };

  const getDifferenceInDays = (date2) => (Date.now() - date2.getTime()) / 86_400_000; // 1000 * 3600 * 24

  const accessToken = await SettingsStorageAccessor().loadAccessToken();

  if (accessToken === '') {
    console.error('no access token no party');
    throw noAccessTokenError;
  }

  const userName = (await graphqlRequest('query { viewer { login } }')).viewer.login;

  return { getAll, getReviewRequested, getTeamReviewRequested, getNoReviewRequested, getAllReviewsDone, getMissingAssignee, getAllAssigned };
};

export default GithubApiWrapper;
