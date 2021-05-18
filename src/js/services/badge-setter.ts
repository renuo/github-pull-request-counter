import { PullRequestRecord, CounterSettings, PullRequestRecordKey } from '../static/types';

const BadgeSetter = () => {
  const update = (record: PullRequestRecord, counter: CounterSettings): void => {
    const count = calculateTotalPullRequests(record, counter);

    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: calculateBackgroundColor(count) });
  };

  const calculateTotalPullRequests = (record: PullRequestRecord, counter: CounterSettings): number => {
    let total = 0;

    for (const key of Object.keys(record)) {
      if (counter[key as PullRequestRecordKey]) total += record[key as PullRequestRecordKey].length;
    }

    return total;
  };

  const calculateBackgroundColor = (count: number): string => {
    const okLimit = 0;
    const warningLimit = 2;
    const green = '#5cb85c';
    const yellow = '#f0ad4e';
    const red = '#d9534f';

    if (count <= okLimit) return green;
    if (count <= warningLimit) return yellow;
    return red;
  };

  const clear = (): void => {
    chrome.action.setBadgeText({ text: '0' });
    chrome.action.setBadgeBackgroundColor({ color: calculateBackgroundColor(0) });
  };

  return { update, clear };
};

export default BadgeSetter;
