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
}
