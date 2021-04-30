import puppeteer from 'puppeteer';
import axios from 'axios';

let browser: puppeteer.Browser;
let page: puppeteer.Page;

const env = process.env;

const makeRequest = async (path: string, params?: string) => {
  return await axios.get(`https://api.github.com${path}?${params}`, {
    auth: {
      username: env.USERNAME!,
      password: env.ACCESS_TOKEN!
    }
  });
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

  it('only fetch the ones with a review thingy', async () => {
    let subscribed = (await makeRequest('/issues', 'filter=subscribed')).data;
    subscribed = subscribed.filter(item => item.pull_request);
    subscribed = subscribed.filter(item => item.author_association != 'NONE');

    const assigned = (await makeRequest('/issues', 'filter=assigned')).data;
    const created = (await makeRequest('/issues', 'filter=created')).data;
    let assigned_and_created = assigned.concat(created);
    assigned_and_created = assigned_and_created.map(item => item.url)

    let reviews = subscribed.filter(item => !assigned_and_created.includes(item.url));

    console.log(reviews);
  });

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
