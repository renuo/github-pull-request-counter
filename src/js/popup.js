import PullRequestStorageAccessor from './services/pull-request-storage-accessor.js';
import HTMLGenerator from './services/html-generator.js';
import SettingsStorageAccessor from './services/settings-storage-accessor.js';
import {isTest} from "./services/utils.js";

const Popup = async () => {

    let refreshButton = document.getElementById('refresh');
    async function replaceHtml() {
        const pullRequests = await PullRequestStorageAccessor().loadPullRequests();
        const counter = await SettingsStorageAccessor().loadCounterConfig();
        const html = HTMLGenerator().generate(pullRequests, counter);

        const popupElement = document.getElementById('popup');
        if (popupElement) {
            popupElement.replaceChildren();
            popupElement.appendChild(html);
        }
    }

    function toggleRefreshButton(toggle) {
        if (toggle) {
            refreshButton.disabled = false;
            refreshButton.classList.remove('disabled');
            refreshButton.innerText = 'Refresh';
        } else {
            refreshButton.disabled = true;
            refreshButton.classList.add('disabled');
            refreshButton.innerText = 'Refreshing...';
        }
    }


    refreshButton.addEventListener('click', async (event) => {
        if (refreshButton.disabled) {
            console.log("disabled")
            return;
        }

        toggleRefreshButton(false);

        chrome.runtime.sendMessage({reloadPr: true})
            .then((response) => {
                // very good
            })
            .catch((error) => {
                // too bad
            });


        event.preventDefault();
        return false;
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.refreshPopup !== undefined) {
            replaceHtml();
            toggleRefreshButton(true);
        }
    })

    await replaceHtml();
};

export default Popup;

if (!isTest()) {
    Popup();
}
