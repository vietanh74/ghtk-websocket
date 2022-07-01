const { merge } = require('webpack-merge');
const path = require('path');
const LIBRARY_NAME = require('../package.json').name;

const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  entry: {
    index: './src/index',
  },
  output: {
    filename: 'index.js',
    path: path.resolve(process.cwd(), 'dist'),
    library: LIBRARY_NAME,
    libraryTarget: 'umd',
    clean: true,
  },
});
