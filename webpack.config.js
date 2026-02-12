/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-check
'use strict'

const path = require('path')
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin')
const { createUnplugin } = require('unplugin')

/** @type {import('webpack').Configuration} */
const config = {
  target: 'node',
  optimization: {
    minimize: false,
  },
  entry: './src/extension.ts',
  output: {
    hashFunction: 'sha256',
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    library: {
      type: 'commonjs2',
    },
    devtoolModuleFilenameTemplate: '../[resource-path]',
  },
  devtool: 'source-map',
  externals: {
    'vscode': 'commonjs vscode',
    'nodejieba': 'nodejieba',
    'esm': 'esm',
    'ts-node': 'ts-node',
    'consolidate': 'consolidate',
    'vue-i18n-locale-message': 'vue-i18n-locale-message',
    'vue-template-compiler': 'vue-template-compiler',
    'fluent-vue-cli': 'fluent-vue-cli',
    'less': '_',
    'sass': '_',
    'stylus': '_',
    'prettier': 'prettier',
    '@microsoft/typescript-etw': '_',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [
      new TsconfigPathsPlugin(),
    ],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
    ],
  },
  ignoreWarnings: [
    /Critical dependency: the request of a dependency is an expression/,
  ],
  plugins: [
    createUnplugin(() => {
      return {
        name: 'replace',
        enforce: 'pre',
        transform(code) {
          return code.replace(/process\.env\.NODE_ENV/g, JSON.stringify(process.env.I18N_ALLY_ENV))
        },
      }
    }).webpack(),
  ],
}

module.exports = config
