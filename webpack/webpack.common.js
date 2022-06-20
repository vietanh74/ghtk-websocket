const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
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
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "package.json",
          to: "",
        },
      ],
    }),
  ],
};
