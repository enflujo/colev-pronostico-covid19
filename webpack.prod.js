const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { baseCss } = require('./webpack.ayudas');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  target: ['es5', 'browserslist'],
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [MiniCssExtractPlugin.loader, ...baseCss],
      },
    ],
  },
  plugins: [new CleanWebpackPlugin(), new MiniCssExtractPlugin()],
});
