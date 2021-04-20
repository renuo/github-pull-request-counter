const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    popup: './src/js/popup.ts',
    background: './src/js/background.ts',
    options: './src/js/options.ts',
  },
  module: {
    rules: [
      { test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader"
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
        { from: './src/icons/icon.png' },
        { from: './src/icons/icon-light.png' },
        { from: './src/icons/icon16.png' },
        { from: './src/icons/icon48.png' },
        { from: './src/icons/icon128.png' },
      ],
    }),
  ],
  output: { filename: '[name].js', path: path.resolve(__dirname, 'dist') },
};
