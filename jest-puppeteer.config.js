module.exports = {
  launch: {
    dumpio: true, // Print browser console to stdout for debugging
    product: 'chrome',
    headless: true,
    ignoreHTTPSErrors: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      `--disable-extensions-except=${process.env.EXTENSION_PATH || ''}`,
      `--load-extension=${process.env.EXTENSION_PATH || ''}`,
      '--user-data-dir=/tmp/chrome-test-profile'
    ],
    pipe: true,
    timeout: 60000,
  },
  browserContext: 'default',
  exitOnPageError: false, // Don't exit on uncaught errors
  server: {
    command: 'echo "No server needed"',
    port: 4444,
    launchTimeout: 60000,
    debug: true,
  },
}
