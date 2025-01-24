import { CounterConfig } from '../static/types';

const SettingsStorageAccessor = () => {
  const storeCounterConfig = (counter: CounterConfig): void => store('counter', JSON.stringify(counter));

  const loadCounterConfig = async (): Promise<CounterConfig> => {
    const counterJSON = await load('counter');
    if (counterJSON) {
      return JSON.parse(counterJSON);
    } else {
      return {
        reviewRequested: true,
        teamReviewRequested: true,
        noReviewRequested: true,
        allReviewsDone: true,
        missingAssignee: true,
        allAssigned: false,
      };
    }
  };

  const storeScope = (list: string): void => store('scope', list);

  const loadScope = async (): Promise<string> => (await load('scope')) || '';

  const storeTeams = (list: string): void => store('teams', list);

  const loadTeams = async (): Promise<string> => (await load('teams')) || '';

  interface IgnorePattern {
    type: 'literal' | 'regex';
    pattern: string;
  }

  const storeIgnoredPrs = (list: string): void => {
    // Convert comma-separated list to structured format
    const patterns = list.split(',').map(item => {
      const trimmed = item.trim();
      if (trimmed.startsWith('regex:')) {
        return {
          type: 'regex' as const,
          pattern: trimmed.substring(6), // Remove 'regex:' prefix
        };
      }
      return {
        type: 'literal' as const,
        pattern: trimmed,
      };
    });
    store('ignored', JSON.stringify(patterns));
  };

  const loadIgnoredPrs = async (): Promise<string> => {
    const stored = await load('ignored');
    if (!stored) return '';
    try {
      // Try to parse as JSON (new format)
      const patterns: IgnorePattern[] = JSON.parse(stored);
      return patterns.map(p => p.type === 'regex' ? `regex:${p.pattern}` : p.pattern).join(',');
    } catch {
      // If parsing fails, assume it's the old format
      return stored;
    }
  };

  const removeIgnoredPr = async (pr: string) => {
    const stored = await load('ignored');
    if (!stored) return;

    try {
      // Try to parse as JSON (new format)
      const patterns: IgnorePattern[] = JSON.parse(stored);
      const newPatterns = patterns.filter(p => {
        if (p.type === 'literal') {
          return p.pattern !== pr;
        }
        return true; // Keep all regex patterns
      });
      store('ignored', JSON.stringify(newPatterns));
    } catch {
      // If parsing fails, assume it's the old format
      const newIgnoredPrs = stored.split(',').filter((p) => p.trim() !== pr).join(',');
      store('ignored', newIgnoredPrs);
    }
  };

  const storeMaximumAge = (value: number): void => {
    store('maximumAge', value.toString());
  };

  const loadMaximumAge = async (): Promise<number> => parseInt(await load('maximumAge') || '999', 10);

  const storeAccessToken = (accessToken: string): void => store('accessToken', accessToken);

  const loadAccessToken = async (): Promise<string> => (await load('accessToken')) || '';

  const store = (key: string, value: string): void => chrome.storage.local.set({ [key]: value });

  const load = async (key: string): Promise<string> => {
    const data: { [key: string]: string } = await new Promise((resolve) => {
      chrome.storage.local.get(key, (items) => {
        resolve(items);
      });
    });

    return data[key];
  };

  return {
    storeCounterConfig, loadCounterConfig, storeScope, loadScope, storeTeams, loadTeams, storeMaximumAge, loadMaximumAge,
    storeAccessToken, loadAccessToken, loadIgnoredPrs, storeIgnoredPrs, removeIgnoredPr,
  };
};

export default SettingsStorageAccessor;
