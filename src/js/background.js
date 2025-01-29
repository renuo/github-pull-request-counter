import GithubApiWrapper from './services/github-api-wrapper.js';
import PullRequestStorageAccessor from './services/pull-request-storage-accessor.js';
import BadgeSetter from './services/badge-setter.js';
import SettingsStorageAccessor from './services/settings-storage-accessor.js';
import {noAccessTokenError, tooManyRequestsError, PullRequestRecordKey} from './services/constants.js';
import {containsPullRequest, isTest} from './services/utils.js';

const pollingInterval = 1;

const ServiceWorker = () => {
    const fetchAndStoreData = async () => {
        let github;
        const storage = PullRequestStorageAccessor();

        try {
            github = await GithubApiWrapper();
        } catch (error) {
            if (error === noAccessTokenError) {
                storage.clearPullRequests();
                BadgeSetter().clear();
                return;
            } else if (error === tooManyRequestsError) return;

            throw error;
        }

        let recordEntries;
        try {
            recordEntries = await Promise.all([
                github.getReviewRequested(),
                github.getTeamReviewRequested(),
                github.getNoReviewRequested(),
                github.getAllReviewsDone(),
                github.getMissingAssignee(),
                github.getAllAssigned(),
            ]);
        } catch (error) {
            if (error === tooManyRequestsError) return;

            throw error;
        }

        const record = {
            [PullRequestRecordKey.reviewRequested]: recordEntries[0],
            [PullRequestRecordKey.teamReviewRequested]: recordEntries[1],
            [PullRequestRecordKey.noReviewRequested]: recordEntries[2],
            [PullRequestRecordKey.allReviewsDone]: recordEntries[3],
            [PullRequestRecordKey.missingAssignee]: recordEntries[4],
            [PullRequestRecordKey.allAssigned]: recordEntries[5],
        };

        await filterIgnoredPrs(record);

        const counter = await SettingsStorageAccessor().loadCounterConfig();
        BadgeSetter().update(record, counter);

        storage.storePullRequests(record);

        console.debug("Service worker has refreshed the PRs")
        chrome.runtime.sendMessage({refreshPopup: true}).then((response) => {

        }).catch((error) => {
            console.warn("An error occurred while refreshing the PRs", error);
        });
    };

    const filterIgnoredPrs = async (record) => {
        const ignoredPrs = await PullRequestStorageAccessor().syncIgnoredPrs(record);
        Object.keys(record).forEach((key) => {
            record[key] = record[key].filter((pr) => {
                return !containsPullRequest(ignoredPrs, pr);
            });
        });
    };

    const startPolling = async () => {
        await fetchAndStoreData();

        chrome.alarms.create('polling', {periodInMinutes: pollingInterval});

        // TODO: I cound't get any test to run this code properly.
        /* istanbul ignore next */
        chrome.alarms.onAlarm.addListener((alarm) => {
            /* istanbul ignore next */
            if (alarm.name === 'polling') fetchAndStoreData();
        });

        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.reloadPr !== undefined) {
                fetchAndStoreData()
                console.debug("Service worker is now refreshing the PRs")
                sendResponse({message: "Service worker processed the message"})
            }
        })
    };

    return {fetchAndStoreData, startPolling};
};

export default ServiceWorker;

if (!isTest()) {
    ServiceWorker().startPolling();
}
