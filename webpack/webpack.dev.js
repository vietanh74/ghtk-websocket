const { merge } = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    index: './src/test/index',
  },
  output: {
    filename: 'index.js',
    path: path.resolve(process.cwd(), 'dist'),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      templateContent: `
        <html>
          <body>
            <h3>Hello World</h3>
          </body>
        </html>
      `
    }),
  ],
  devServer: {
    static: './dist',
    port: 8080,
    static: {
      directory: path.join(process.cwd(), 'public'),
    },
  },
});
