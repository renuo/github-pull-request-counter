const { merge } = require('webpack-merge');
const { common, developmentKeyCopyPlugin } = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge({
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new webpack.DefinePlugin({
      ENV: JSON.stringify('development')
    }),
    developmentKeyCopyPlugin,
  ],
}, common);
