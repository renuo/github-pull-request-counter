# Github Pull Request Counter

A browser extension to remove mental load when working with pull requests.
It has been published in
the [Chrome Web Store](https://chrome.google.com/webstore/detail/github-pull-request-count/eeejbcmnmgogpkgeinlbchoafjjbegmi)
and the [Firefox Add-ons Store](https://addons.mozilla.org/en-US/firefox/addon/github-pull-request-counter/) to be
installed with one click.

## Manual setup

```sh
git clone git@github.com:renuo/github-pull-request-counter.git
cd github-pull-request-counter
bin/setup
```

### M1 / M2

For people using a macbook with the Apple arm chip:

```sh
brew install chromium

export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=`which chromium`
```

## Build & Test

To build the extension just run:

```sh
zip -r dist/dist.zip src
```

this will create a new zip file with everything needed.

To run it locally, you can load the unpacked extension by pointing to the `src` folder.

## Add to chrome

* Visit `chrome://extensions/`.
* Enable _"Developer mode"_ in the top right corner.
* Click _"Load unpacked"_ in the top left corner.
* Navigate to the root of this repository and select `dist` it.

_Note: If you have the extension already installed through the webstore you won't be able to add the development
version. Either remove it or create a new chrome profile to get around the issue._

## Tests

```sh
bin/check
```

## Linting

```sh
bin/fastcheck
```

## Deployment

The deployment process for this extension is handled through Semaphore CI.

When you initiate a deployment:

- A new build is uploaded to both the Chrome Web Store and the Firefox Add-ons Store.
- The `version` in `src/manifest.json` must be incremented before deployment — otherwise, the upload will be rejected.
- Once uploaded, the extensions are automatically submitted for publication. They will go live after each platform’s
  review process is complete (this can take some time).

Steps to release:

1. Bump the version field in src/manifest.json.
2. Trigger the manual deploy jobs in Semaphore CI.
3. Check the developer dashboards
   for [Chrome](https://chrome.google.com/u/0/webstore/devconsole/465f37d5-ddb2-42c9-afcc-37265e67af35/eeejbcmnmgogpkgeinlbchoafjjbegmi/edit?hl=en)
   and [Firefox](https://addons.mozilla.org/en-US/developers/addon/github-pull-request-counter) to ensure the upload was
   successful.
4. Wait for the review process to complete.

## Create a permanent development ID

This is already done for this project.

* Do the steps described under "**Add to chrome**"
* Click "Pack extension" and then "Remove"
* Chrome made 2 new files in the parent directory of the dist folder. Drag and drop `dist.srx` into
  `chrome://extensions/` and install it. Copy the id displayed under `ID:`.
* Head to the the User Data Directory. For mac: `~/Library/Application\ Support/Google/Chrome`. For
  other: https://chromium.googlesource.com/chromium/src/+/master/docs/user_data_dir.md
* From the User Data Directory open `Default/Extensions/_<extensionId>_/_<versionString>_/manifest.json`.
  `_<extensionId>_` is equal to the ID gained in step 3. `_<versionString>_` is just `0.0.0`.
* Copy the key from `"key:"` and paste it into your manifest.json: `"key: <key>"`

## Issues

* When running the tests chromium might ask you: "_Do you want to allow the application Chromium.app to accept incoming
  network connections?_". You can remove this by running
  `sudo codesign --force --deep --sign - ./node_modules/puppeteer/.local-chromium/mac-*/chrome-mac/Chromium.app`. This
  will create a valid certificate. Sudo is necessary. [Source](https://github.com/puppeteer/puppeteer/issues/4752)
* Chromium can't be run in headless when testing extensions. [Source](https://github.com/puppeteer/puppeteer/issues/659)

## Copyright

Copyright [Renuo AG](https://www.renuo.ch/), published under the MIT license.
