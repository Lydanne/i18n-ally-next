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
    'fluent-vue-cli': 'fluent-vue-cli',
    'less': '_',
    'sass': '_',
    'stylus': '_',
    '@microsoft/typescript-etw': '_',
  },
  resolve: {
    alias: {
      // The locale-message library only uses parse(); its package entry also
      // imports optional template engines that are unrelated to SFC parsing.
      '@vue/component-compiler-utils$': require.resolve('@vue/component-compiler-utils/dist/parse', { paths: [require.resolve('vue-i18n-locale-message')] }),
      // Parsing an SFC does not require the consumer's Vue runtime version.
      'vue-template-compiler$': require.resolve('vue-template-compiler/build'),
    },
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
