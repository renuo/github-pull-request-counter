module.exports = {
  preset: 'jest-puppeteer',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  "moduleNameMapper": {
    "^.+\\.(css|less|scss)$": "identity-obj-proxy"
  },
  setupFiles: ["dotenv/config"],
  collectCoverage: true,
  collectCoverageFrom: [
    "**/*ts",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/mocks/**",
  ],
  testTimeout: 150000
}
