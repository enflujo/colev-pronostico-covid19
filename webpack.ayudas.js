module.exports = {
  baseCss: [
    {
      loader: 'css-loader',
    },
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: ['postcss-preset-env', 'autoprefixer'],
        },
      },
    },
    {
      loader: 'sass-loader',
    },
  ],
};
