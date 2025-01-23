const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

exports.common = {
  entry: {
    popup: './src/js/popup.js',
    background: './src/js/background.js',
    options: './src/js/options.js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          "css-loader"
        ]
      }
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new HtmlWebpackPlugin({
      template: 'src/popup.html',
      filename: 'popup.html',
      chunks: ["popup"],
    }),
    new HtmlWebpackPlugin({
      template: 'src/options.html',
      filename: 'options.html',
      chunks: ["options"],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/manifest.json' },
        { from: './src/icons/icon16.png' },
        { from: './src/icons/icon32.png' },
        { from: './src/icons/icon48.png' },
        { from: './src/icons/icon128.png' },
      ],
    }),
    new Dotenv()
  ],
  output: { filename: '[name].js', path: path.resolve(__dirname, 'dist') },
};

const TESTING_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1vqcsaDZhcxUMfLeqPuNrv8L7QB7EeaVHxXEm8+CQ9+lGpgCyJK8AZt1dil9L88xpOIAA/5tv9/DhY+z86x0QnKHouq2xaabQL1uSaGk7lqoNI78cNYDaOxPTjfUmn4MJCPvbaRKxtNjmlQ/U+mfp3HLtR8ixELQbJkgt9zgVBpTKf2bQ/fMzZ0tV+sVbcwmkl7L735B8R6KucFH4aL4hrBcUp/2PY76Sv402kRUIR66affT4m+J5Dr21CopvQqIKrymzy44ZuXONOil41LjhoqoecnYP6iD9fuhxjghJDno9UnK4q1h4vM7r+Y7uc7Z7oW3i4de6RXd1B8dP4LdOwIDAQAB";

exports.developmentKeyCopyPlugin = new CopyWebpackPlugin({
  patterns: [
    {from: 'src/manifest.json', transform: (manifestBuffer, _path) => {
      const manifestString = manifestBuffer.toString().replace(/\}\n\}/g, `},\n  "key": "${TESTING_KEY}"\n}`);
      return Buffer.from(manifestString);
    }},
  ],
});
