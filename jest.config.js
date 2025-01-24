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
  },
  testEnvironment: 'jest-environment-puppeteer',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  testTimeout: 30000,
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
