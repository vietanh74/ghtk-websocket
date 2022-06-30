const { merge } = require('webpack-merge');
const path = require('path');

const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  entry: {
    index: './src/index',
  },
  output: {
    filename: 'index.js',
    path: path.resolve(process.cwd(), 'dist'),
    library: 'vietanh-websocket',
    libraryTarget: 'umd',
    clean: true,
  },
});
