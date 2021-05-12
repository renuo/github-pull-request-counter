module.exports = {
  preset: 'jest-puppeteer',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
    'ENV': 'development',
  },
  "moduleNameMapper": {
    "^.+\\.(css|less|scss)$": "identity-obj-proxy"
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "**/*ts",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/mocks/**",
  ],
  testTimeout: 150000
}
