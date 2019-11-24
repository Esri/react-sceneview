const merge = require('webpack-merge');
const path = require('path');

const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  entry: './src/index.jsx',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'react-sceneview.js',
    library: 'react-sceneview',
    libraryTarget: 'umd',
  },
  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react',
      umd: 'react',
    },
  },
});
