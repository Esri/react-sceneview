const path = require('path');
const webpack = require('webpack');

const MinifyPlugin = require('babel-minify-webpack-plugin');


module.exports = {
  module: {
    loaders: [
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
    modules: [path.resolve(__dirname, '/src/'), 'node_modules/'],
    descriptionFiles: ['package.json'],
    extensions: ['.js', '.jsx'],
  },
  entry: {
    'react-sceneview': [
      'idempotent-babel-polyfill',
      './src/index.jsx',
    ],
    'react-sceneview.min': [
      'idempotent-babel-polyfill',
      './src/index.jsx',
    ],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    library: 'react-sceneview',
    libraryTarget: 'umd',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new MinifyPlugin({}, {
      include: /\.min\.js$/,
    }),
  ],
};
