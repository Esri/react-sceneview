const webpack = require('webpack');
const merge = require('webpack-merge');

const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  entry: './example/main.jsx',
  output: {
    publicPath: '/example/js/',
    filename: 'app.bundle.js',
  },
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    hot: true,
    stats: 'minimal',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
  ],
});
