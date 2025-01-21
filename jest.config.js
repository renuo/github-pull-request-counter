module.exports = {
  preset: 'jest-puppeteer',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
    '^.+\\.js$': ['babel-jest', {
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]]
    }]
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
  coverageThreshold: {
    "global": {
      "branches": 100,
      "functions": 100,
      "lines": 100,
      "statements": 100
    }
  },
}
