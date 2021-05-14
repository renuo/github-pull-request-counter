const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'cheap-source-map', // Without source maps the extension can't load properly.
  plugins: [
    new webpack.DefinePlugin({
      ENV: JSON.stringify('production')
    })
  ],
});
