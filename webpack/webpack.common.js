const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const dotenv = require('dotenv').config({ path: process.cwd() + '/.env'});
const webpack = require('webpack');

module.exports = {
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: 'swc-loader',
      },
    ],
  },
  optimization: {
    usedExports: true,
    moduleIds: 'deterministic',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.join(process.cwd(), 'src')
    }
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "package.json",
          to: "",
        },
        {
          from: "README.md",
          to: "",
        },
      ],
    }),

    new webpack.DefinePlugin({
      "process.env": JSON.stringify(dotenv.parsed) || {},
    }),
  ],
};
