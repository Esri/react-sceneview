const path = require('path');
const MinifyPlugin = require('babel-minify-webpack-plugin');

module.exports = {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
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
      '@babel/polyfill',
      './src/index.jsx',
    ],
    'react-sceneview.min': [
      '@babel/polyfill',
      './src/index.jsx',
    ],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    library: 'react-sceneview',
    libraryTarget: 'umd',
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new MinifyPlugin({}, {
      include: /\.min\.js$/,
    }),
  ],
};
