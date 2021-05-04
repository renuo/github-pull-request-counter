import puppeteer from 'puppeteer';
import axios from 'axios';

let browser: puppeteer.Browser;
let page: puppeteer.Page;

const env = process.env;

const makeRequest = async (path: string, params?: string) => {
  console.log(`https://api.github.com${path}?${params}`);
  return await axios.get(`https://api.github.com${path}?${params}`, {
    auth: {
      username: env.USERNAME!,
      password: env.ACCESS_TOKEN!
    }
  });
}

const makeRequestFullURL = async (path: string, params?: string) => {
  console.log(`${path}?${params}`);
  return await axios.get(`${path}?${params}`, {
    auth: {
      username: env.USERNAME!,
      password: env.ACCESS_TOKEN!
    }
  });
}

// https://advancedweb.hu/how-to-use-async-functions-with-array-filter-in-javascript/
// TODO: Replace any
const asyncFilter = async (array: [], predicate: (item: any) => Promise<boolean>) => {
  const results = await Promise.all(array.map(predicate));

  return array.filter((_item, index) => results[index]);
}

describe('authetification', () => {
  // it('get user information', async () => {
  //   const response = await makeRequest('/user')
  //   expect(response.data.login).toEqual(env.USERNAME);
  // });

  // it('fetch the github-pull-request-counter repo', async () => {
  //   const response = await makeRequest('/repos/renuo/github-pull-request-counter')
  //   expect(response.data.full_name).toEqual('renuo/github-pull-request-counter');
  // });

  // it('fetch the events', async () => {
  //   const response = await makeRequest('/users/janis-leuenberger/events')
  //   console.log(response.data);
  //   expect(response.data[response.data.length -1].actor.login).toEqual('Janis-Leuenberger');
  // })

  // it('all notifications', async () => {
  //   const response = await makeRequest('/notifications')
  //   console.log(response.data);
  // })

  // it('fetch issues', async () => {
  //   let response = await makeRequest('/issues', 'filter=assigned')
  //   console.log(response.data.length)
  //   console.log('------------------------------------------------------------------------------------------------');

  //   response = await makeRequest('/issues', 'filter=created')
  //   console.log('------------------------------------------------------------------------------------------------');
  //   console.log(response.data.length)

  //   response = await makeRequest('/issues', 'filter=mentioned')
  //   console.log(response.data.length)
  //   console.log('------------------------------------------------------------------------------------------------');

  //   response = await makeRequest('/issues', 'filter=subscribed')
  //   console.log(response.data.length);
  //   console.log('------------------------------------------------------------------------------------------------');

  //   response = await makeRequest('/issues', 'filter=all')
  //   console.log(response.data.length)
  // });

  // it('only fetch the ones with a review thingy', async () => {
  //   let subscribed = (await makeRequest('/issues', 'filter=subscribed')).data;

  //   subscribed = subscribed.filter(item => item.pull_request);
  //   subscribed = subscribed.filter(item => item.author_association != 'NONE');

  //   const assigned = (await makeRequest('/issues', 'filter=assigned')).data;
  //   const created = (await makeRequest('/issues', 'filter=created')).data;
  //   let assigned_and_created = assigned.concat(created);
  //   assigned_and_created = assigned_and_created.map(item => item.url)

  //   let reviews = subscribed.filter(item => !assigned_and_created.includes(item.url));

  //   console.log(reviews);
  // });

  // it('review requested', async () => {
  //   const q = encodeURIComponent('is:open is:pr review-requested:Janis-Leuenberger archived:false');
  //   let search = (await makeRequest('/search/issues', `q=${q}`));
  //   console.log(search);
  // })
  it('asignee no reviews requested', async () => {
    const q = encodeURIComponent('is:pr assignee:Janis-Leuenberger archived:false is:open review:none');
    let noReviews = (await makeRequest('/search/issues', `q=${q}`)).data;

    const f = await asyncFilter(noReviews.items, async (issue: any) => {
      let asd = (await makeRequestFullURL(`${issue.pull_request.url}/requested_reviewers`)).data;
      console.log(asd);
      return asd.users.length + asd.teams.length > 0;
    });

    // console.log(noReviews.items)
  });
  // it('asignee all reviews done or changes requested', async () => {
  //   const q = encodeURIComponent('is:pr assignee:Janis-Leuenberger archived:false is:open review:approved');
  //   let approved = (await makeRequest('/search/issues', `q=${q}`)).data;
  //   const q2 = encodeURIComponent('is:pr assignee:Janis-Leuenberger archived:false is:open review:changes_requested');
  //   let changes_requested = (await makeRequest('/search/issues', `q=${q2}`)).data;
  //   let done = approved.items.concat(changes_requested.items);
  //   console.log(done);
  // })
  // it('author with no assignee', async () => {
  //   const q = encodeURIComponent('is:open is:pr author:Janis-Leuenberger archived:false');
  //   let pulls = (await makeRequest('/search/issues', `q=${q}`)).data;
  //   pulls = pulls.items.filter(s => !s.assignee);
  //   console.log(pulls);
  // })



  // it('fetch all issues important to me', async () => {
  //   let issues = await makeRequest('/issues', 'filter=subscribed')
  //   // @ts-ignore
  //   let pull_requests = issues.data.map(d => d.pull_request).filter(Boolean)
  //   console.log(pull_requests);
  // })

  // it('fetch user issues', async () => {
  //   let response = await makeRequest('/user/issues', 'filter=subscribed');
  //   console.log(response.data);
  // })

  // I dont't think this is any good
  // it('fetch user hovercars', async () => {
  //   let response = await makeRequest('/users/janis-leuenberger/hovercard', 'subject_type=pull_request')
  //   console.log(response.data)
  // })
});
// });
// it('token', () => {
//   const URL = 'https://api.github.com/user'
//   const HEADERS = {'Authorization': 'token' + env.ACCESS_TOKEN};
//   // console.log(http.get({path: URL}));
//   await http.request({host: 'https://api.github.com', path: '/user'}, (response) => {
//     var str = ''
//     response.on('data', function (chunk) {
//       str += chunk;
//     });

//     response.on('end', function () {
//       console.log(str);
//     });
//   }).end();
// })

// it('oauth', async() => {
//   browser = await puppeteer.launch({ headless: false, });

//   page = await browser.newPage();

//   const URL = 'https://github.com/login/oauth/authorize?client_id=Iv1.48e70b3aabbcd41d'

//   await page.goto(URL, {
//     waitUntil: 'networkidle2'
//   }); //await page.waitFor('input[name=search]');

//   await page.focus('#login_field');
//   await page.keyboard.type(env.USERNAME!);

//   await page.focus('#password');
//   await page.keyboard.type(env.PASSWORD!);

//   // @ts-ignore
//   await page.$eval('input[name=commit]', el => el.click());
