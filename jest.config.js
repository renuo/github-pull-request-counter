module.exports = {
  preset: 'jest-puppeteer',
  transform: {
    '^.+\\.js$': ['babel-jest', {
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
      plugins: ['@babel/plugin-transform-modules-commonjs']
    }]
  },
  globals: {
    'ENV': 'testing',
    'chrome': {
      storage: {
        local: {
          get: jest.fn(),
          set: jest.fn(),
        },
      },
      action: {
        setBadgeText: jest.fn(),
        setBadgeBackgroundColor: jest.fn(),
      },
      alarms: {
        create: jest.fn(),
        onAlarm: {
          addListener: jest.fn(),
        },
      },
    },
  },
  testEnvironment: 'jest-environment-puppeteer',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  testTimeout: 60000,
  verbose: true,
  setupFilesAfterEnv: ['./jest.setup.js'],
  "moduleNameMapper": {
    "^.+\\.(css|less|scss)$": "identity-obj-proxy"
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "src/js/**/*.js",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/mocks/**",
    "!**/coverage/**",
    "!jest.config.js",
  ],
  coverageThreshold: {
    "global": {
      "branches": 100,
      "functions": 100,
      "lines": 100,
      "statements": 100
    }
  },
}
