import { Issue } from '../types/types';

interface PullRequestObject {
  [key: string]: Issue[]
}

const StorageSerilizer = () => {

  // TODO: remove any
  const storePullRequests = (pullRequests: PullRequestObject ) => {
    for (let key in pullRequests) {
      let value = pullRequests[key];

      storePullRequest(key, value);
    }
  }

  const loadPullRequests = async ( keys: string[] ) => {
    let pullRequestObjects: PullRequestObject = {};

    for (var i = 0; i < keys.length; i++) {
      const key = keys[i];
      pullRequestObjects[key] = await loadPullRequest(key);
    }

    return pullRequestObjects;
  }

  // TODO: remove any
  const storePullRequest = (key: string, reviewRequested: any) => {
    chrome.storage.local.set({ [key]: JSON.stringify(reviewRequested) });
  }

  const loadPullRequest = async(key: string) => {
    // TODO replace with type
    let data: {[key: string]: string} = await new Promise(function(resolve, reject) {
       chrome.storage.local.get(key, (items) => {
         resolve(items);
       })
    });

    return JSON.parse(data[key] as string ) // TODO check if there is no better way
  }

  return { storePullRequests, loadPullRequests, storePullRequest, loadPullRequest };
}

export default StorageSerilizer;
