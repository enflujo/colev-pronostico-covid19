const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { baseCss } = require('./webpack.ayudas');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  target: 'web',
  devServer: {
    watchOptions: {
      ignored: '/node_modules/',
    },
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [
          {
            loader: 'style-loader',
          },
          ...baseCss,
        ],
      },
    ],
  },
});
