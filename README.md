# Github Pull Request Counter

A chrome extension to remove mental load when working with pull requests.

## Setup

```sh
git clone git@github.com:renuo/github-pull-request-counter.git
cd github-pull-request-counter
bin/setup
```

## Run
* Visit `chrome://extensions/`.
* Enable _"Developer mode"_ in the top right corner.
* Click _"Load unpacked"_ in the top left corner.
* Navigate to the root of this repository and select it.

## Tests

```sh
bin/check
```

## Linting

```sh
bin/fastcheck
```

## Create a permanent development ID

This is already done for this project.

* Do the steps described under "**Run**"
* Click "Pack extension" and then "Remove"
* Chrome made 2 new files in the parent directory of the dist folder. Drag and drop `dist.srx` into `chrome://extensions/` and install it. Copy the id displayed under `ID:`.
* Head to the the User Data Directory. For mac: `~/Library/Application Support/Google/Chrome`. For other: https://chromium.googlesource.com/chromium/src/+/master/docs/user_data_dir.md
* From the User Data Directory open `Default/Extensions/_<extensionId>_/_<versionString>_/manifest.json`. `_<extensionId>_` is equal to the ID gained in step 3. `_<versionString>_` is just `0.0.0`.
* Copy the key from `"key:"` and paste it into your manifest.json: `"key: <key>"`

## Issues

* When running the tests chromium might ask you: "_Do you want to allow the application Chromium.app to accept incoming network connections?_". You can remove this by running `sudo codesign --force --deep --sign - ./node_modules/puppeteer/.local-chromium/mac-*/chrome-mac/Chromium.app`. This will create a valid certificate. Sudo is necessary. [Source](https://github.com/puppeteer/puppeteer/issues/4752)
* Chromium can't be run in headless when testing extensions. [Source](https://github.com/puppeteer/puppeteer/issues/659)

## Copyright

Coypright 2021 [Renuo AG](https://www.renuo.ch/).


