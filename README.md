# Github Pull Request Counter

A chrome extension to remove mental load when working with pull requests.

## Installation

Todo: Add instalation guide

## Setup

```sh
git clone git@github.com:renuo/github-pull-request-counter.git
cd github-pull-request-counter
bin/setup
```

## Create a permanent ID
* Do the steps described under "**Run**"
* Click "Pack extension" and then "Remove"
* Chrome made 2 new files in the parent directory of the dist folder. Drag and drop `dist.srx` into `chrome://extensions/` and install it. Copy the id displayed under `ID:`.
* Head to the the User Data Directory. For mac: `~/Library/Application Support/Google/Chrome`. For other: https://chromium.googlesource.com/chromium/src/+/master/docs/user_data_dir.md
* From the User Data Directory open `Default/Extensions/_<extensionId>_/_<versionString>_/manifest.json`. `_<extensionId>_` is equal to the ID gained in step 3. `_<versionString>_` is just `0.0.0`.
* Copy the key from `"key:"` and paste it into your manifest.json: `"key: <key>"`

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

## Copyright

Coypright 2021 [Renuo AG](https://www.renuo.ch/).


