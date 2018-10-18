const path = require('path');
const webpack = require('webpack');

module.exports = {
  module: {
    loaders: [
      {
        enforce: 'pre',
        test: /\.jsx?$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react'],
        },
      },
    ],
  },
  resolve: {
    modules: [path.resolve(__dirname, '/example/'), 'dist/', 'node_modules/'],
    descriptionFiles: ['package.json'],
    extensions: ['.js', '.jsx'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: 'bundle.js',
    chunkFilename: '[id].bundle.js',
  },
  entry: [
    'webpack-dev-server/client?http://localhost:8080', // WebpackDevServer host and port
    'idempotent-babel-polyfill',
    './example/main.jsx',
  ],
  devtool: '#inline-source-map',
  devServer: {
    inline: true,
    port: 8080,
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
  ],
};
