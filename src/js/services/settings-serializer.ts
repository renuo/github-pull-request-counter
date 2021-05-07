interface Counter {
  reviewRequested: boolean;
  noReviewRequested: boolean;
  allReviewsDone: boolean;
  missingAssignee: boolean;
}

const SettingsSerializer = () => {
  const storeCounter = (counter: Counter): void => {
    store('counter', JSON.stringify(counter));
  };

  const loadCounter = async (): Promise<Counter> => {
    return (JSON.parse(await load('counter')));
  };

  const storeScope = (list: string): void => {
    store('scope', list);
  };

  const loadScope = async (): Promise<string> => {
    return (load('scope'));
  };

  const store = (key: string, value: string): void => {
    chrome.storage.sync.set({ key: value });
  };

  const load = async (key: string): Promise<string> => {
    const data: { [key: string]: string } = await new Promise((resolve) => {
      chrome.storage.local.get(key, (items) => {
        resolve(items);
      });
    });

    return data[key];
  };

  return { storeCounter, loadCounter, storeScope, loadScope };
};

export default SettingsSerializer;
