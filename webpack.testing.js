const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const CopyWebpackPlugin = require("copy-webpack-plugin");

const TESTING_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1vqcsaDZhcxUMfLeqPuNrv8L7QB7EeaVHxXEm8+CQ9+lGpgCyJK8AZt1dil9L88xpOIAA/5tv9/DhY+z86x0QnKHouq2xaabQL1uSaGk7lqoNI78cNYDaOxPTjfUmn4MJCPvbaRKxtNjmlQ/U+mfp3HLtR8ixELQbJkgt9zgVBpTKf2bQ/fMzZ0tV+sVbcwmkl7L735B8R6KucFH4aL4hrBcUp/2PY76Sv402kRUIR66affT4m+J5Dr21CopvQqIKrymzy44ZuXONOil41LjhoqoecnYP6iD9fuhxjghJDno9UnK4q1h4vM7r+Y7uc7Z7oW3i4de6RXd1B8dP4LdOwIDAQAB";

module.exports = merge({
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new webpack.DefinePlugin({
      ENV: JSON.stringify('testing')
    }),
    new CopyWebpackPlugin({
      patterns: [
        {from: 'src/manifest.json', transform: (manifestBuffer, _path) => {
          const manifestString = manifestBuffer.toString().replace(/\}\n\}/g, `},\n  "key": "${TESTING_KEY}"\n}`);
          return Buffer.from(manifestString);
        }},
      ],
    }),
  ],
}, common);
