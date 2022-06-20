const path = require('path');

module.exports = {
  entry: {
    index: './src/index.js',
  },
  output: {
    filename: 'index.js',
    path: path.resolve(process.cwd(), 'dist'),
    library: 'ghtk-websocket',
    libraryTarget: 'umd',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/i,
        use: ['babel-loader'],
      },
    ],
  },
  optimization: {
    usedExports: true,
    moduleIds: 'deterministic',
  },
};
