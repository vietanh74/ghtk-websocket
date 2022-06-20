const path = require('path');

module.exports = {
  entry: {
    index: './src/index',
  },
  output: {
    filename: 'index.js',
    path: path.resolve(process.cwd(), 'dist'),
    library: 'ghtk-websocket',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      // {
      //   test: /\.js$/i,
      //   use: ['babel-loader'],
      // },
      {
        test: /\.ts?$/,
        loader: 'ts-loader',
      },
    ],
  },
  optimization: {
    usedExports: true,
    moduleIds: 'deterministic',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};
