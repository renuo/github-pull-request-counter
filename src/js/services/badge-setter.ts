import { PullRequestRecord, Counter } from '../static/types';

const BadgeSetter = () => {
  const update = (record: PullRequestRecord, counter: Counter) => {
    const count = calculateTotalPullRequests(record, counter);

    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: caculateBackgroundColor(count) });
  };

  const calculateTotalPullRequests = (record: PullRequestRecord, counter: Counter) => {
    let total = 0;

    for (const key of Object.keys(record)) {
      if (counter[key]) total += record[key].length;
    }

    return total;
  };

  // TODO add to documentation
  const caculateBackgroundColor = (count: number) => {
    const okLimit = 0;
    const warningLimit = 2;
    const green = '#5cb85c';
    const yellow = '#f0ad4e';
    const red = '#d9534f';

    if (count <= okLimit) return green;
    if (count <= warningLimit) return yellow;
    return red;
  };

  return { update };
};

export default BadgeSetter;
